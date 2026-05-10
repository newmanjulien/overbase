import { v } from 'convex/values';
import {
	builderRunSetupsEqual,
	normalizeBuilderRunSetup,
	type BuilderRunSetup
} from '@overbase/builder-sdk/app-protocol';
import { internal } from './_generated/api';
import { mutation, query } from './_generated/server';
import type { MutationCtx } from './_generated/server';
import {
	builderRunSetup,
	emailDraft as emailDraftValidator
} from './builderEmailValidators';
import {
	hasEmailDraftChanged,
	normalizeEmailDraft
} from '@overbase/builder-sdk/email';
import {
	createResumeToken,
	getBuilderSessionExpiresAt,
	hashResumeToken,
	isBuilderSessionActive,
	normalizeResumeToken,
	normalizeStartRequestId,
	normalizeUserText,
	verifyResumeToken
} from './builderSessionAccess';
import {
	buildSessionSnapshot,
	getAuthorizedSession,
	insertJob
} from './builderSessionCore';
import {
	getActiveBuilderAppPresentationEntry
} from '../builder-apps/registry';

async function getIdempotentStartSnapshot(
	ctx: MutationCtx,
	{
		appSlug,
		startRequestId,
		resumeToken,
		setup,
		expiresAt,
		now
	}: {
		appSlug: string;
		startRequestId?: string;
		resumeToken?: string;
		setup: BuilderRunSetup;
		expiresAt: number;
		now: number;
	}
) {
	if (!startRequestId || !resumeToken) {
		return null;
	}

	const existingSession = await ctx.db
		.query('builderSessions')
		.withIndex('by_app_startRequestId', (q) =>
			q.eq('appSlug', appSlug).eq('startRequestId', startRequestId)
		)
		.first();

	if (!existingSession) {
		return null;
	}

	if (!isBuilderSessionActive(existingSession, now)) {
		throw new Error('Builder session expired.');
	}

	if (!(await verifyResumeToken(existingSession, resumeToken))) {
		throw new Error('Builder session not found.');
	}

	const firstMessage = await ctx.db
		.query('builderSessionMessages')
		.withIndex('by_session_createdAt', (q) => q.eq('sessionId', existingSession._id))
		.first();

	if (firstMessage?.role !== 'user' || firstMessage.text !== setup.initialMessage) {
		throw new Error('Start request id was already used for a different message.');
	}

	if (!builderRunSetupsEqual(existingSession.setup, setup)) {
		throw new Error('Start request id was already used for a different setup.');
	}

	await ctx.db.patch(existingSession._id, {
		expiresAt,
		updatedAt: now
	});

	const resumedSession = await ctx.db.get(existingSession._id);

	if (!resumedSession) {
		throw new Error('Builder session not found.');
	}

	return await buildSessionSnapshot(ctx, resumedSession, resumeToken);
}

export const startSession = mutation({
	args: {
		appSlug: v.string(),
		setup: builderRunSetup,
		startRequestId: v.optional(v.string()),
		resumeToken: v.optional(v.string())
	},
	handler: async (ctx, { appSlug, setup, startRequestId, resumeToken }) => {
		const now = Date.now();
		const normalizedSetup = normalizeBuilderRunSetup({
			...setup,
			initialMessage: normalizeUserText(setup.initialMessage)
		});
		const normalizedStartRequestId = normalizeStartRequestId(startRequestId);
		const normalizedResumeToken = normalizeResumeToken(resumeToken);
		const expiresAt = getBuilderSessionExpiresAt(now);
		const app = getActiveBuilderAppPresentationEntry(appSlug);

		if (!app) {
			throw new Error('Builder app not found.');
		}

		if (Boolean(normalizedStartRequestId) !== Boolean(normalizedResumeToken)) {
			throw new Error('Start request id and resume token must be provided together.');
		}

		const existingSessionSnapshot = await getIdempotentStartSnapshot(ctx, {
			appSlug: app.slug,
			startRequestId: normalizedStartRequestId,
			resumeToken: normalizedResumeToken,
			setup: normalizedSetup,
			expiresAt,
			now
		});

		if (existingSessionSnapshot) {
			return existingSessionSnapshot;
		}

		const sessionResumeToken = normalizedResumeToken ?? createResumeToken();
		const resumeTokenHash = await hashResumeToken(sessionResumeToken);

		const sessionId = await ctx.db.insert('builderSessions', {
			appSlug: app.slug,
			appTitle: app.slug,
			...(normalizedStartRequestId ? { startRequestId: normalizedStartRequestId } : {}),
			setup: normalizedSetup,
			status: 'working',
			resumeTokenHash,
			createdAt: now,
			updatedAt: now,
			expiresAt
		});

		const userMessageId = await ctx.db.insert('builderSessionMessages', {
			sessionId,
			role: 'user',
			text: normalizedSetup.initialMessage,
			status: 'complete',
			createdAt: now,
			updatedAt: now
		});
		const jobId = await insertJob(ctx, {
			sessionId,
			kind: 'startTurn',
			createdAt: now
		});
		const assistantMessageId = await ctx.db.insert('builderSessionMessages', {
			sessionId,
			role: 'assistant',
			text: '',
			status: 'pending',
			jobId,
			createdAt: now + 1,
			updatedAt: now + 1
		});
		await ctx.db.patch(jobId, {
			assistantMessageId,
			updatedAt: now
		});
		await ctx.db.patch(sessionId, {
			activeTurnJobId: jobId,
			updatedAt: now
		});
		await ctx.scheduler.runAfter(
			0,
			internal.builderSessionJobRuns.runStartTurn,
			{ jobId }
		);

		const session = await ctx.db.get(sessionId);

		if (!session) {
			throw new Error('Builder session not found after start.');
		}

		return {
			...(await buildSessionSnapshot(ctx, session, sessionResumeToken)),
			userMessageId,
			assistantMessageId
		};
	}
});

export const resumeSession = mutation({
	args: {
		sessionId: v.id('builderSessions'),
		resumeToken: v.string()
	},
	handler: async (ctx, { sessionId, resumeToken }) => {
		const now = Date.now();
		const session = await getAuthorizedSession(ctx, sessionId, resumeToken, now);

		if (!session) {
			return null;
		}

		const expiresAt = getBuilderSessionExpiresAt(now);

		await ctx.db.patch(session._id, {
			expiresAt,
			updatedAt: now
		});

		const resumedSession = await ctx.db.get(session._id);

		return resumedSession ? await buildSessionSnapshot(ctx, resumedSession, resumeToken) : null;
	}
});

export const getSessionSnapshot = query({
	args: {
		sessionId: v.id('builderSessions'),
		resumeToken: v.string()
	},
	handler: async (ctx, { sessionId, resumeToken }) => {
		const session = await getAuthorizedSession(ctx, sessionId, resumeToken);

		if (!session) {
			return null;
		}

		return await buildSessionSnapshot(ctx, session, resumeToken);
	}
});

export const sendMessage = mutation({
	args: {
		sessionId: v.id('builderSessions'),
		resumeToken: v.string(),
		text: v.string()
	},
	handler: async (ctx, { sessionId, resumeToken, text }) => {
		const now = Date.now();
		const normalizedText = normalizeUserText(text);
		const session = await getAuthorizedSession(ctx, sessionId, resumeToken, now);

		if (!session) {
			throw new Error('Builder session not found.');
		}

		if (session.activeTurnJobId) {
			throw new Error('Please wait for the assistant response to finish before sending another message.');
		}

		if (session.status !== 'waitingForUser' && session.status !== 'ready') {
			throw new Error('This builder is not ready for another message yet.');
		}

		const expiresAt = getBuilderSessionExpiresAt(now);
		const userMessageId = await ctx.db.insert('builderSessionMessages', {
			sessionId: session._id,
			role: 'user',
			text: normalizedText,
			status: 'complete',
			createdAt: now,
			updatedAt: now
		});
		const jobId = await insertJob(ctx, {
			sessionId: session._id,
			kind: 'continueTurn',
			createdAt: now
		});
		const assistantMessageId = await ctx.db.insert('builderSessionMessages', {
			sessionId: session._id,
			role: 'assistant',
			text: '',
			status: 'pending',
			jobId,
			createdAt: now + 1,
			updatedAt: now + 1
		});
		await ctx.db.patch(jobId, {
			assistantMessageId,
			updatedAt: now
		});
		await ctx.db.patch(session._id, {
			status: 'working',
			activeTurnJobId: jobId,
			expiresAt,
			updatedAt: now
		});
		await ctx.scheduler.runAfter(
			0,
			internal.builderSessionJobRuns.runContinueTurn,
			{ jobId }
		);

		const updatedSession = await ctx.db.get(session._id);

		if (!updatedSession) {
			throw new Error('Builder session not found after send.');
		}

		return {
			...(await buildSessionSnapshot(ctx, updatedSession, resumeToken)),
			userMessageId,
			assistantMessageId
		};
	}
});

export const saveEmailDraft = mutation({
	args: {
		sessionId: v.id('builderSessions'),
		resumeToken: v.string(),
		baseEmailDraftVersion: v.number(),
		emailDraft: emailDraftValidator
	},
	handler: async (ctx, { sessionId, resumeToken, baseEmailDraftVersion, emailDraft }) => {
		const now = Date.now();
		const session = await getAuthorizedSession(ctx, sessionId, resumeToken, now);

		if (!session || !session.emailDraftState || session.emailDraftState.visibility !== 'visible') {
			throw new Error('Email draft not found.');
		}

		if (session.activeTurnJobId) {
			throw new Error('Please wait for the assistant response to finish before editing the draft.');
		}

		if (baseEmailDraftVersion !== session.emailDraftState.version) {
			throw new Error(
				'The draft changed while you were editing. Review the latest version before saving.'
			);
		}

		const normalizedDraft = normalizeEmailDraft(emailDraft);
		const previousDraft = normalizeEmailDraft(session.emailDraftState.draft);
		const expiresAt = getBuilderSessionExpiresAt(now);

		if (!hasEmailDraftChanged(previousDraft, normalizedDraft)) {
			await ctx.db.patch(session._id, {
				expiresAt,
				updatedAt: now
			});

			const updatedSession = await ctx.db.get(session._id);

			return {
				snapshot: updatedSession ? await buildSessionSnapshot(ctx, updatedSession, resumeToken) : null,
				expiresAt,
				emailDraftVersion: session.emailDraftState.version,
				changed: false
			};
		}

		const nextEmailDraftVersion = session.emailDraftState.version + 1;

		await ctx.db.patch(session._id, {
			emailDraftState: {
				version: nextEmailDraftVersion,
				visibility: 'visible',
				draft: normalizedDraft
			},
			expiresAt,
			updatedAt: now
		});

		const updatedSession = await ctx.db.get(session._id);

		return {
			snapshot: updatedSession ? await buildSessionSnapshot(ctx, updatedSession, resumeToken) : null,
			expiresAt,
			emailDraftVersion: nextEmailDraftVersion,
			changed: true
		};
	}
});
