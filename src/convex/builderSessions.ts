import { v } from 'convex/values';
import { internal } from './_generated/api';
import { mutation, query } from './_generated/server';
import {
	emailDraft as emailDraftValidator
} from './emailDesignValidators';
import {
	CUSTOM_EMAIL_BUILDER_BLUEPRINT_ID,
	getEmailDraftChangedFields,
	hasEmailDraftChanged,
	normalizeEmailDraft,
	summarizeEmailDraftEdit
} from './emailDesign';
import {
	createResumeToken,
	getConversationExpiresAt,
	hashResumeToken,
	normalizeUserText
} from './conversationCore';
import {
	buildSessionSnapshot,
	createOperationId,
	getAuthorizedSession,
	insertOperation
} from './builderSessionCore';
import { getActiveNotificationProduct } from '../external/blueprints/content';

export const startSession = mutation({
	args: {
		initialMessage: v.string()
	},
	handler: async (ctx, { initialMessage }) => {
		const now = Date.now();
		const normalizedInitialMessage = normalizeUserText(initialMessage);
		const resumeToken = createResumeToken();
		const resumeTokenHash = await hashResumeToken(resumeToken);
		const expiresAt = getConversationExpiresAt(now);
		const product = getActiveNotificationProduct(CUSTOM_EMAIL_BUILDER_BLUEPRINT_ID);

		if (!product) {
			throw new Error('Custom notification product not found.');
		}

		const sessionId = await ctx.db.insert('builderSessions', {
			productSlug: product.slug,
			productTitle: product.title,
			artifactKind: 'email',
			artifactVersion: 0,
			phase: 'routing',
			artifactVisibility: 'hidden',
			workingArtifactStatus: 'none',
			visibleArtifactStatus: 'notReleased',
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
		const operationId = createOperationId();
		const assistantMessageId = await ctx.db.insert('builderSessionMessages', {
			sessionId,
			role: 'assistant',
			text: '',
			status: 'pending',
			operationId,
			createdAt: now + 1,
			updatedAt: now + 1
		});

		await insertOperation(ctx, {
			sessionId,
			kind: 'routeAndAsk',
			operationId,
			assistantMessageId,
			createdAt: now
		});
		await ctx.db.patch(sessionId, {
			activeMessageOperationId: operationId,
			updatedAt: now
		});
		await ctx.scheduler.runAfter(0, internal.builderSessionJobs.routeAndAsk, {
			operationId
		});

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

		const expiresAt = getConversationExpiresAt(now);

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

		if (session.activeMessageOperationId) {
			throw new Error('Please wait for the assistant response to finish before sending another message.');
		}

		if (session.phase !== 'waitingForInitialAnswer' && session.phase !== 'ready') {
			throw new Error('This builder is not ready for another message yet.');
		}

		const expiresAt = getConversationExpiresAt(now);
		const userMessageId = await ctx.db.insert('builderSessionMessages', {
			sessionId: session._id,
			role: 'user',
			text: normalizedText,
			status: 'complete',
			createdAt: now,
			updatedAt: now
		});
		const operationKind = session.phase === 'waitingForInitialAnswer' ? 'applyInitialAnswer' : 'refine';
		const operationId = createOperationId();
		const assistantMessageId = await ctx.db.insert('builderSessionMessages', {
			sessionId: session._id,
			role: 'assistant',
			text: '',
			status: 'pending',
			operationId,
			createdAt: now + 1,
			updatedAt: now + 1
		});

		await insertOperation(ctx, {
			sessionId: session._id,
			kind: operationKind,
			operationId,
			assistantMessageId,
			createdAt: now
		});
		await ctx.db.patch(session._id, {
			phase: operationKind === 'applyInitialAnswer' ? 'applyingInitialAnswer' : 'refining',
			initialAnswerText: operationKind === 'applyInitialAnswer' ? normalizedText : session.initialAnswerText,
			activeMessageOperationId: operationId,
			expiresAt,
			updatedAt: now
		});
		await ctx.scheduler.runAfter(
			0,
			operationKind === 'applyInitialAnswer'
				? internal.builderSessionJobs.applyInitialAnswerOperation
				: internal.builderSessionJobs.refineOperation,
			{ operationId }
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

export const saveVisibleEmailDraft = mutation({
	args: {
		sessionId: v.id('builderSessions'),
		resumeToken: v.string(),
		baseArtifactVersion: v.number(),
		emailDraft: emailDraftValidator
	},
	handler: async (ctx, { sessionId, resumeToken, baseArtifactVersion, emailDraft }) => {
		const now = Date.now();
		const session = await getAuthorizedSession(ctx, sessionId, resumeToken, now);

		if (!session || !session.visibleEmailDraft) {
			throw new Error('Email draft not found.');
		}

		if (session.activeMessageOperationId) {
			throw new Error('Please wait for the assistant response to finish before editing the draft.');
		}

		if (baseArtifactVersion !== session.artifactVersion) {
			throw new Error(
				'The draft changed while you were editing. Review the latest version before saving.'
			);
		}

		const normalizedDraft = normalizeEmailDraft(emailDraft);
		const previousDraft = normalizeEmailDraft(session.visibleEmailDraft);
		const expiresAt = getConversationExpiresAt(now);

		if (!hasEmailDraftChanged(previousDraft, normalizedDraft)) {
			await ctx.db.patch(session._id, {
				expiresAt,
				updatedAt: now
			});

			const updatedSession = await ctx.db.get(session._id);

			return {
				snapshot: updatedSession ? await buildSessionSnapshot(ctx, updatedSession, resumeToken) : null,
				expiresAt,
				artifactVersion: session.artifactVersion,
				changed: false
			};
		}

		const changedFields = getEmailDraftChangedFields(previousDraft, normalizedDraft);
		const nextArtifactVersion = session.artifactVersion + 1;

		await ctx.db.patch(session._id, {
			artifactVersion: nextArtifactVersion,
			visibleEmailDraft: normalizedDraft,
			workingEmailDraft: normalizedDraft,
			visibleArtifactStatus: 'ready',
			expiresAt,
			updatedAt: now
		});
		await ctx.db.insert('builderSessionEvents', {
			sessionId: session._id,
			type: 'artifactEditedByUser',
			versionBefore: session.artifactVersion,
			versionAfter: nextArtifactVersion,
			changedFields,
			summary: summarizeEmailDraftEdit(changedFields),
			createdAt: now
		});

		const updatedSession = await ctx.db.get(session._id);

		return {
			snapshot: updatedSession ? await buildSessionSnapshot(ctx, updatedSession, resumeToken) : null,
			expiresAt,
			artifactVersion: nextArtifactVersion,
			changed: true
		};
	}
});
