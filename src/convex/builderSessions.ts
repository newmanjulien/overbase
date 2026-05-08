import { v } from 'convex/values';
import { internal } from './_generated/api';
import { mutation, query } from './_generated/server';
import {
	emailDraft as emailDraftValidator
} from './builderEmailValidators';
import {
	getEmailDraftChangedFields,
	hasEmailDraftChanged,
	normalizeEmailDraft,
	summarizeEmailDraftEdit
} from '@overbase/builder-sdk/email';
import {
	createResumeToken,
	getBuilderSessionExpiresAt,
	hashResumeToken,
	normalizeUserText
} from './builderSessionAccess';
import {
	buildSessionSnapshot,
	getAuthorizedSession,
	insertJob
} from './builderSessionCore';
import {
	getActiveBuilderAppPresentationEntry
} from '../builder-apps/registry';

export const startSession = mutation({
	args: {
		appSlug: v.string(),
		initialMessage: v.string()
	},
	handler: async (ctx, { appSlug, initialMessage }) => {
		const now = Date.now();
		const normalizedInitialMessage = normalizeUserText(initialMessage);
		const resumeToken = createResumeToken();
		const resumeTokenHash = await hashResumeToken(resumeToken);
		const expiresAt = getBuilderSessionExpiresAt(now);
		const app = getActiveBuilderAppPresentationEntry(appSlug);

		if (!app) {
			throw new Error('Builder app not found.');
		}

		const sessionId = await ctx.db.insert('builderSessions', {
			appSlug: app.slug,
			appTitle: app.slug,
			emailDraftVersion: 0,
			status: 'working',
			resumeTokenHash,
			createdAt: now,
			updatedAt: now,
			expiresAt
		});

		const userMessageId = await ctx.db.insert('builderSessionMessages', {
			sessionId,
			role: 'user',
			text: normalizedInitialMessage,
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
			...(await buildSessionSnapshot(ctx, session, resumeToken)),
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

		if (!session || !session.emailDraft) {
			throw new Error('Email draft not found.');
		}

		if (session.activeTurnJobId) {
			throw new Error('Please wait for the assistant response to finish before editing the draft.');
		}

		if (baseEmailDraftVersion !== session.emailDraftVersion) {
			throw new Error(
				'The draft changed while you were editing. Review the latest version before saving.'
			);
		}

		const normalizedDraft = normalizeEmailDraft(emailDraft);
		const previousDraft = normalizeEmailDraft(session.emailDraft);
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
				emailDraftVersion: session.emailDraftVersion,
				changed: false
			};
		}

		const changedFields = getEmailDraftChangedFields(previousDraft, normalizedDraft);
		const nextEmailDraftVersion = session.emailDraftVersion + 1;

		await ctx.db.patch(session._id, {
			emailDraftVersion: nextEmailDraftVersion,
			emailDraft: normalizedDraft,
			preparedEmailDraft: normalizedDraft,
			expiresAt,
			updatedAt: now
		});
		await ctx.db.insert('builderSessionEmailDraftEvents', {
			sessionId: session._id,
			type: 'emailDraftEditedByUser',
			versionBefore: session.emailDraftVersion,
			versionAfter: nextEmailDraftVersion,
			changedFields,
			summary: summarizeEmailDraftEdit(changedFields),
			createdAt: now
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
