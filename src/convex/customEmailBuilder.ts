import { v } from 'convex/values';
import { internal } from './_generated/api';
import { mutation, query } from './_generated/server';
import {
	emailDraft as emailDraftValidator
} from './builderEmailValidators';
import {
	CUSTOM_EMAIL_BUILDER_CARD_ID,
	getEmailDraftChangedFields,
	hasEmailDraftChanged,
	normalizeEmailDraft,
	summarizeEmailDraftEdit
} from './emailArtifact';
import {
	createResumeToken,
	getConversationExpiresAt,
	hashResumeToken,
	normalizeUserText
} from './conversationCore';
import {
	buildRunSnapshot,
	createOperationId,
	getAuthorizedRun,
	insertOperation
} from './customEmailCore';

export const startRun = mutation({
	args: {
		initialMessage: v.string()
	},
	handler: async (ctx, { initialMessage }) => {
		const now = Date.now();
		const normalizedInitialMessage = normalizeUserText(initialMessage);
		const resumeToken = createResumeToken();
		const resumeTokenHash = await hashResumeToken(resumeToken);
		const expiresAt = getConversationExpiresAt(now);
		const card = await ctx.db
			.query('builderCards')
			.withIndex('by_slug_status', (q) =>
				q.eq('slug', CUSTOM_EMAIL_BUILDER_CARD_ID).eq('status', 'active')
			)
			.unique();

		if (!card) {
			throw new Error('Custom builder card not found.');
		}

		const runId = await ctx.db.insert('customEmailRuns', {
			cardId: card._id,
			builderSlug: card.slug,
			builderTitle: card.title,
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

		const userMessageId = await ctx.db.insert('customEmailMessages', {
			runId,
			role: 'user',
			text: normalizedInitialMessage,
			status: 'complete',
			createdAt: now,
			updatedAt: now
		});
		const operationId = createOperationId();
		const assistantMessageId = await ctx.db.insert('customEmailMessages', {
			runId,
			role: 'assistant',
			text: '',
			status: 'pending',
			operationId,
			createdAt: now + 1,
			updatedAt: now + 1
		});

		await insertOperation(ctx, {
			runId,
			kind: 'routeAndAsk',
			operationId,
			assistantMessageId,
			createdAt: now
		});
		await ctx.db.patch(runId, {
			activeMessageOperationId: operationId,
			updatedAt: now
		});
		await ctx.scheduler.runAfter(0, internal.customEmailOperations.routeAndAsk, {
			operationId
		});

		const run = await ctx.db.get(runId);

		if (!run) {
			throw new Error('Builder run not found after start.');
		}

		return {
			...(await buildRunSnapshot(ctx, run, resumeToken)),
			userMessageId,
			assistantMessageId
		};
	}
});

export const resumeRun = mutation({
	args: {
		runId: v.id('customEmailRuns'),
		resumeToken: v.string()
	},
	handler: async (ctx, { runId, resumeToken }) => {
		const now = Date.now();
		const run = await getAuthorizedRun(ctx, runId, resumeToken, now);

		if (!run) {
			return null;
		}

		const expiresAt = getConversationExpiresAt(now);

		await ctx.db.patch(run._id, {
			expiresAt,
			updatedAt: now
		});

		const resumedRun = await ctx.db.get(run._id);

		return resumedRun ? await buildRunSnapshot(ctx, resumedRun, resumeToken) : null;
	}
});

export const getRunSnapshot = query({
	args: {
		runId: v.id('customEmailRuns'),
		resumeToken: v.string()
	},
	handler: async (ctx, { runId, resumeToken }) => {
		const run = await getAuthorizedRun(ctx, runId, resumeToken);

		if (!run) {
			return null;
		}

		return await buildRunSnapshot(ctx, run, resumeToken);
	}
});

export const sendMessage = mutation({
	args: {
		runId: v.id('customEmailRuns'),
		resumeToken: v.string(),
		text: v.string()
	},
	handler: async (ctx, { runId, resumeToken, text }) => {
		const now = Date.now();
		const normalizedText = normalizeUserText(text);
		const run = await getAuthorizedRun(ctx, runId, resumeToken, now);

		if (!run) {
			throw new Error('Builder run not found.');
		}

		if (run.activeMessageOperationId) {
			throw new Error('Please wait for the assistant response to finish before sending another message.');
		}

		if (run.phase !== 'waitingForInitialAnswer' && run.phase !== 'ready') {
			throw new Error('This builder is not ready for another message yet.');
		}

		const expiresAt = getConversationExpiresAt(now);
		const userMessageId = await ctx.db.insert('customEmailMessages', {
			runId: run._id,
			role: 'user',
			text: normalizedText,
			status: 'complete',
			createdAt: now,
			updatedAt: now
		});
		const operationKind = run.phase === 'waitingForInitialAnswer' ? 'applyInitialAnswer' : 'refine';
		const operationId = createOperationId();
		const assistantMessageId = await ctx.db.insert('customEmailMessages', {
			runId: run._id,
			role: 'assistant',
			text: '',
			status: 'pending',
			operationId,
			createdAt: now + 1,
			updatedAt: now + 1
		});

		await insertOperation(ctx, {
			runId: run._id,
			kind: operationKind,
			operationId,
			assistantMessageId,
			createdAt: now
		});
		await ctx.db.patch(run._id, {
			phase: operationKind === 'applyInitialAnswer' ? 'applyingInitialAnswer' : 'refining',
			initialAnswerText: operationKind === 'applyInitialAnswer' ? normalizedText : run.initialAnswerText,
			activeMessageOperationId: operationId,
			expiresAt,
			updatedAt: now
		});
		await ctx.scheduler.runAfter(
			0,
			operationKind === 'applyInitialAnswer'
				? internal.customEmailOperations.applyInitialAnswerOperation
				: internal.customEmailOperations.refineOperation,
			{ operationId }
		);

		const updatedRun = await ctx.db.get(run._id);

		if (!updatedRun) {
			throw new Error('Builder run not found after send.');
		}

		return {
			...(await buildRunSnapshot(ctx, updatedRun, resumeToken)),
			userMessageId,
			assistantMessageId
		};
	}
});

export const saveVisibleEmailDraft = mutation({
	args: {
		runId: v.id('customEmailRuns'),
		resumeToken: v.string(),
		baseArtifactVersion: v.number(),
		emailDraft: emailDraftValidator
	},
	handler: async (ctx, { runId, resumeToken, baseArtifactVersion, emailDraft }) => {
		const now = Date.now();
		const run = await getAuthorizedRun(ctx, runId, resumeToken, now);

		if (!run || !run.visibleEmailDraft) {
			throw new Error('Email draft not found.');
		}

		if (run.activeMessageOperationId) {
			throw new Error('Please wait for the assistant response to finish before editing the draft.');
		}

		if (baseArtifactVersion !== run.artifactVersion) {
			throw new Error(
				'The draft changed while you were editing. Review the latest version before saving.'
			);
		}

		const normalizedDraft = normalizeEmailDraft(emailDraft);
		const previousDraft = normalizeEmailDraft(run.visibleEmailDraft);
		const expiresAt = getConversationExpiresAt(now);

		if (!hasEmailDraftChanged(previousDraft, normalizedDraft)) {
			await ctx.db.patch(run._id, {
				expiresAt,
				updatedAt: now
			});

			const updatedRun = await ctx.db.get(run._id);

			return {
				snapshot: updatedRun ? await buildRunSnapshot(ctx, updatedRun, resumeToken) : null,
				expiresAt,
				artifactVersion: run.artifactVersion,
				changed: false
			};
		}

		const changedFields = getEmailDraftChangedFields(previousDraft, normalizedDraft);
		const nextArtifactVersion = run.artifactVersion + 1;

		await ctx.db.patch(run._id, {
			artifactVersion: nextArtifactVersion,
			visibleEmailDraft: normalizedDraft,
			workingEmailDraft: normalizedDraft,
			visibleArtifactStatus: 'ready',
			expiresAt,
			updatedAt: now
		});
		await ctx.db.insert('customEmailEvents', {
			runId: run._id,
			type: 'artifactEditedByUser',
			versionBefore: run.artifactVersion,
			versionAfter: nextArtifactVersion,
			changedFields,
			summary: summarizeEmailDraftEdit(changedFields),
			createdAt: now
		});

		const updatedRun = await ctx.db.get(run._id);

		return {
			snapshot: updatedRun ? await buildRunSnapshot(ctx, updatedRun, resumeToken) : null,
			expiresAt,
			artifactVersion: nextArtifactVersion,
			changed: true
		};
	}
});
