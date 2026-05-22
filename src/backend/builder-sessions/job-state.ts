import {
	getPrimaryEmailDraftArtifact,
	getVisiblePrimaryEmailDraftArtifact
} from '@overbase/builder-sdk/artifacts';
import { getActiveBuilderAppPresentationEntry } from '../../builder-apps/registry';
import { internal } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx } from '../../convex/_generated/server';
import { isBuilderSessionActive } from './expiry';
import {
	BACKGROUND_JOB_MAX_ATTEMPTS,
	BACKGROUND_JOB_RETRY_MS,
	completeJobRecord,
	failJobRecord,
	getJobById,
	insertJob
} from './records';
import {
	applyBuilderSessionOutputEvents,
	type BuilderSessionOutputEvent
} from './output-events';
import type { BuilderAppOutputEvent } from '@overbase/builder-sdk/app-protocol';

type RunnableTurnContext = {
	appSlug: string;
	setup: Doc<'builderSessions'>['setup'];
	artifacts: Doc<'builderSessions'>['artifacts'];
	appState?: Doc<'builderSessions'>['appState'];
};

async function failBackgroundJobState(
	ctx: MutationCtx,
	job: Doc<'builderSessionJobs'>,
	errorText: string,
	now: number
) {
	const session = await ctx.db.get(job.sessionId);

	if (!session) {
		await ctx.db.patch(job._id, {
			status: 'failed',
			errorText,
			updatedAt: now
		});
		return;
	}

	if (session.activeTurnJobId) {
		const activeTurnJob = await getJobById(ctx, session.activeTurnJobId);

		if (activeTurnJob && activeTurnJob.status !== 'complete' && activeTurnJob.status !== 'failed') {
			await ctx.db.patch(activeTurnJob._id, {
				status: 'failed',
				errorText,
				updatedAt: now
			});

			if (activeTurnJob.assistantMessageId) {
				await ctx.db.patch(activeTurnJob.assistantMessageId, {
					status: 'failed',
					errorText,
					updatedAt: now
				});
			}
		}
	}

	await ctx.db.patch(job._id, {
		status: 'failed',
		errorText,
		updatedAt: now
	});
	await ctx.db.patch(job.sessionId, {
		status: 'failed',
		activeTurnJobId: undefined,
		activeBackgroundJobId: undefined,
		errorText,
		updatedAt: now
	});
}

async function getSessionMessages(ctx: MutationCtx, sessionId: Doc<'builderSessions'>['_id']) {
	return await ctx.db
		.query('builderSessionMessages')
		.withIndex('by_session_createdAt', (q) => q.eq('sessionId', sessionId))
		.collect();
}

export async function appendAssistantMessageDelta(
	ctx: MutationCtx,
	{
		jobId,
		delta
	}: {
		jobId: Id<'builderSessionJobs'>;
		delta: string;
	}
) {
	const job = await getJobById(ctx, jobId);

	if (!job?.assistantMessageId || job.status !== 'running') {
		return;
	}

	const message = await ctx.db.get(job.assistantMessageId);

	if (!message || message.status === 'failed' || message.status === 'complete') {
		return;
	}

	const now = Date.now();

	await ctx.db.patch(message._id, {
		text: `${message.text}${delta}`,
		status: 'streaming',
		updatedAt: now
	});
}

export async function claimStartTurn(
	ctx: MutationCtx,
	jobId: Id<'builderSessionJobs'>
): Promise<RunnableTurnContext | null> {
	const now = Date.now();
	const job = await getJobById(ctx, jobId);

	if (!job || job.kind !== 'startTurn' || job.status !== 'pending') {
		return null;
	}

	const session = await ctx.db.get(job.sessionId);

	if (!session || !isBuilderSessionActive(session, now)) {
		await failJobRecord(ctx, jobId, 'This builder session is no longer active.', now);
		return null;
	}

	if (session.activeTurnJobId !== jobId) {
		await completeJobRecord(ctx, job, now);
		return null;
	}

	if (!getActiveBuilderAppPresentationEntry(session.appSlug)) {
		await failJobRecord(ctx, jobId, 'This app is unavailable.', now);
		return null;
	}

	await ctx.db.patch(job._id, {
		status: 'running',
		updatedAt: now
	});

	return {
		appSlug: session.appSlug,
		setup: session.setup,
		artifacts: session.artifacts,
		appState: session.appState
	};
}

export async function claimContinueTurn(ctx: MutationCtx, jobId: Id<'builderSessionJobs'>) {
	const now = Date.now();
	const job = await getJobById(ctx, jobId);

	if (!job || job.kind !== 'continueTurn' || job.status !== 'pending') {
		return {
			state: 'terminal' as const
		};
	}

	const session = await ctx.db.get(job.sessionId);

	if (!session || !isBuilderSessionActive(session, now)) {
		await failJobRecord(ctx, jobId, 'This builder session is no longer active.', now);
		return {
			state: 'terminal' as const
		};
	}

	if (session.status === 'failed') {
		await failJobRecord(
			ctx,
			jobId,
			session.errorText ?? 'The draft could not be prepared.',
			now
		);
		return {
			state: 'terminal' as const
		};
	}

	if (session.activeTurnJobId !== jobId) {
		await completeJobRecord(ctx, job, now);
		return {
			state: 'terminal' as const
		};
	}

	if (!getPrimaryEmailDraftArtifact(session.artifacts)) {
		const nextAttempt = job.attempts + 1;

		if (nextAttempt >= BACKGROUND_JOB_MAX_ATTEMPTS || now >= job.deadlineAt) {
			await failJobRecord(
				ctx,
				jobId,
				'The draft took too long to prepare. Please start a new builder session.',
				now
			);

			return {
				state: 'terminal' as const
			};
		}

		await ctx.db.patch(job._id, {
			attempts: nextAttempt,
			updatedAt: now
		});

		return {
			state: 'retry' as const,
			retryAfterMs: BACKGROUND_JOB_RETRY_MS
		};
	}

	if (!getActiveBuilderAppPresentationEntry(session.appSlug)) {
		await failJobRecord(ctx, jobId, 'This app is unavailable.', now);
		return {
			state: 'terminal' as const
		};
	}

	const messages = await getSessionMessages(ctx, session._id);
	const userMessage =
		[...messages].reverse().find((message) => message.role === 'user')?.text ?? '';

	await ctx.db.patch(job._id, {
		status: 'running',
		updatedAt: now
	});

	return {
		state: 'ready' as const,
		appSlug: session.appSlug,
		setup: session.setup,
		userMessage,
		artifacts: session.artifacts,
		appState: session.appState,
		transcript: messages
			.filter((message) => message.status === 'complete' && message.text.trim())
			.slice(-12)
			.map((message) => ({
				role: message.role,
				text: message.text
			}))
	};
}

export async function claimBackgroundJob(
	ctx: MutationCtx,
	jobId: Id<'builderSessionJobs'>
): Promise<RunnableTurnContext | null> {
	const now = Date.now();
	const job = await getJobById(ctx, jobId);

	if (!job || job.kind !== 'background' || job.status !== 'pending') {
		return null;
	}

	const session = await ctx.db.get(job.sessionId);

	if (!session || !isBuilderSessionActive(session, now)) {
		await failBackgroundJobState(ctx, job, 'This builder session is no longer active.', now);
		return null;
	}

	if (session.activeBackgroundJobId !== jobId) {
		await completeJobRecord(ctx, job, now);
		return null;
	}

	if (!getActiveBuilderAppPresentationEntry(session.appSlug)) {
		await failBackgroundJobState(ctx, job, 'This app is unavailable.', now);
		return null;
	}

	await ctx.db.patch(job._id, {
		status: 'running',
		updatedAt: now
	});

	return {
		appSlug: session.appSlug,
		setup: session.setup,
		artifacts: session.artifacts,
		appState: session.appState
	};
}

export async function completeBuilderJob(
	ctx: MutationCtx,
	{
		jobId,
		events
	}: {
		jobId: Id<'builderSessionJobs'>;
		events: BuilderAppOutputEvent[];
	}
) {
	const now = Date.now();
	const job = await getJobById(ctx, jobId);

	if (!job || job.status !== 'running') {
		return;
	}

	const session = await ctx.db.get(job.sessionId);

	if (!session || session.status === 'failed') {
		await completeJobRecord(ctx, job, now);
		return;
	}

	if (job.kind !== 'background' && session.activeTurnJobId !== jobId) {
		await completeJobRecord(ctx, job, now);
		return;
	}

	if (job.kind === 'background' && session.activeBackgroundJobId !== jobId) {
		await completeJobRecord(ctx, job, now);
		return;
	}

	const shouldWaitForUser = events.some((event) => event.type === 'waitForUser');
	const shouldEnqueueBackgroundJob = events.some((event) => event.type === 'enqueueBackgroundJob');
	const backgroundJobId = shouldEnqueueBackgroundJob
		? await insertJob(ctx, {
				sessionId: session._id,
				kind: 'background',
				createdAt: now + 1
			})
		: null;
	const controlEvents: BuilderSessionOutputEvent[] = [];

	if (job.kind !== 'background') {
		controlEvents.push({
			type: 'sessionPatch',
			patch: {
				status: shouldWaitForUser ? 'waitingForUser' : 'ready',
				activeTurnJobId: undefined,
				errorText: undefined
			}
		});
	}

	if (backgroundJobId) {
		controlEvents.push({
			type: 'sessionPatch',
			patch: {
				activeBackgroundJobId: backgroundJobId
			}
		});
	}

	if (job.kind === 'background') {
		controlEvents.push({
			type: 'sessionPatch',
			patch: {
				activeBackgroundJobId: undefined,
				errorText: undefined
			}
		});
	}

	await applyBuilderSessionOutputEvents(ctx, {
		job,
		session,
		now,
		events: [...events, ...controlEvents, { type: 'completeJob' }]
	});

	if (backgroundJobId) {
		await ctx.scheduler.runAfter(0, internal.internal.builderSessions.runBackgroundJob, {
			jobId: backgroundJobId
		});
	}
}

export async function failBuilderJob(
	ctx: MutationCtx,
	{
		jobId,
		errorText
	}: {
		jobId: Id<'builderSessionJobs'>;
		errorText: string;
	}
) {
	const now = Date.now();
	const job = await getJobById(ctx, jobId);

	if (!job) {
		return;
	}

	if (job.kind === 'background') {
		await failBackgroundJobState(ctx, job, errorText, now);
		return;
	}

	const session = await ctx.db.get(job.sessionId);
	const hasVisibleDraft = Boolean(getVisiblePrimaryEmailDraftArtifact(session?.artifacts));

	await failJobRecord(ctx, jobId, errorText, now, {
		status: hasVisibleDraft ? 'ready' : 'failed',
		clearActiveBackgroundJob: !hasVisibleDraft,
		writeSessionError: !hasVisibleDraft
	});
}
