import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import {
	isBuilderSessionActive,
	verifyResumeToken
} from './builderSessionAccess';

export const ASSISTANT_STREAM_FLUSH_INTERVAL_MS = 150;
export const ASSISTANT_STREAM_FLUSH_MIN_CHARS = 120;
export const EXPIRED_SESSION_CLEANUP_LIMIT = 50;
export const BACKGROUND_JOB_RETRY_MS = 500;
export const BACKGROUND_JOB_MAX_ATTEMPTS = 80;
export const JOB_DEADLINE_MS = 45_000;

export function normalizeAssistantText(text: string) {
	return text.trim();
}

export function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : 'Something went wrong.';
}

export async function getAuthorizedSession(
	ctx: QueryCtx | MutationCtx,
	sessionId: Id<'builderSessions'>,
	resumeToken: string,
	now = Date.now()
) {
	const session = await ctx.db.get(sessionId);

	if (!session || !isBuilderSessionActive(session, now)) {
		return null;
	}

	if (!(await verifyResumeToken(session, resumeToken))) {
		return null;
	}

	return session;
}

export async function buildSessionSnapshot(
	ctx: QueryCtx | MutationCtx,
	session: Doc<'builderSessions'>,
	resumeToken: string
) {
	const messages = await ctx.db
		.query('builderSessionMessages')
		.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
		.collect();

	return {
		handle: {
			sessionId: session._id,
			resumeToken,
			appSlug: session.appSlug,
			expiresAt: session.expiresAt
		},
		session,
		messages
	};
}

export async function insertJob(
	ctx: MutationCtx,
	{
		sessionId,
		kind,
		createdAt,
		assistantMessageId
	}: {
		sessionId: Id<'builderSessions'>;
		kind: Doc<'builderSessionJobs'>['kind'];
		createdAt: number;
		assistantMessageId?: Id<'builderSessionMessages'>;
	}
) {
	return await ctx.db.insert('builderSessionJobs', {
		sessionId,
		kind,
		status: 'pending',
		assistantMessageId,
		attempts: 0,
		deadlineAt: createdAt + JOB_DEADLINE_MS,
		createdAt,
		updatedAt: createdAt
	});
}

export async function getJobById(ctx: QueryCtx | MutationCtx, jobId: Id<'builderSessionJobs'>) {
	return await ctx.db.get(jobId);
}

export async function completeJobRecord(
	ctx: MutationCtx,
	job: Doc<'builderSessionJobs'>,
	now: number
) {
	await ctx.db.patch(job._id, {
		status: 'complete',
		updatedAt: now
	});
}

export async function failJobRecord(
	ctx: MutationCtx,
	jobId: Id<'builderSessionJobs'>,
	errorText: string,
	now: number,
	{
		status = 'failed',
		failAssistantMessage = true,
		clearActiveTurnJob = true,
		clearActiveBackgroundJob = true,
		writeSessionError = true
	}: {
		status?: Doc<'builderSessions'>['status'];
		failAssistantMessage?: boolean;
		clearActiveTurnJob?: boolean;
		clearActiveBackgroundJob?: boolean;
		writeSessionError?: boolean;
	} = {}
) {
	const job = await getJobById(ctx, jobId);

	if (!job) {
		return;
	}

	await ctx.db.patch(job._id, {
		status: 'failed',
		errorText,
		updatedAt: now
	});

	if (failAssistantMessage && job.assistantMessageId) {
		await ctx.db.patch(job.assistantMessageId, {
			status: 'failed',
			errorText,
			updatedAt: now
		});
	}

	const session = await ctx.db.get(job.sessionId);

	if (!session) {
		return;
	}

	await ctx.db.patch(job.sessionId, {
		status,
		...(clearActiveTurnJob ? { activeTurnJobId: undefined } : {}),
		...(clearActiveBackgroundJob ? { activeBackgroundJobId: undefined } : {}),
		...(writeSessionError ? { errorText } : {}),
		updatedAt: now
	});
}
