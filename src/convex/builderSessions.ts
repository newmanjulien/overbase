import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalMutation, internalQuery, mutation, query, type MutationCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import {
	applyEmailDraftPatch,
	CUSTOM_EMAIL_BUILDER_CARD_ID,
	createDefaultEmailDraft,
	normalizeEmailDraft
} from './emailArtifact';
import { emailDraft as emailDraftValidator, emailPreviewUpdate } from './builderEmailValidators';
import {
	MAX_MESSAGE_LENGTH,
	createGenerationId,
	getConversationExpiresAt,
	isConversationExpired,
	normalizeUserText
} from './conversationCore';

async function insertPendingBuilderTurn(
	ctx: MutationCtx,
	conversationId: Id<'conversations'>,
	createdAt: number
) {
	const generationId = createGenerationId();
	const assistantMessageId = await ctx.db.insert('messages', {
		conversationId,
		role: 'assistant',
		text: '',
		status: 'pending',
		generationId,
		createdAt,
		updatedAt: createdAt
	});

	await ctx.db.patch(conversationId, {
		pendingAssistantMessageId: assistantMessageId,
		pendingAssistantGenerationId: generationId,
		updatedAt: createdAt
	});

	await ctx.scheduler.runAfter(0, internal.builderTurns.generateEmailBuilderTurn, {
		conversationId,
		assistantMessageId,
		generationId
	});

	return assistantMessageId;
}

function normalizeAssistantText(text: string) {
	const normalized = text.trim();

	return normalized.length > MAX_MESSAGE_LENGTH
		? normalized.slice(0, MAX_MESSAGE_LENGTH).trim()
		: normalized;
}

async function getActiveBuilderTurn(
	ctx: MutationCtx,
	assistantMessageId: Id<'messages'>,
	generationId: string,
	now: number
) {
	const assistantMessage = await ctx.db.get(assistantMessageId);

	if (!assistantMessage) {
		return null;
	}

	if (assistantMessage.role !== 'assistant') {
		throw new Error('Assistant message not found.');
	}

	if (assistantMessage.generationId !== generationId || assistantMessage.status !== 'pending') {
		return null;
	}

	const conversation = await ctx.db.get(assistantMessage.conversationId);

	if (!conversation || isConversationExpired(conversation, now)) {
		return null;
	}

	if (
		conversation.pendingAssistantMessageId !== assistantMessage._id ||
		conversation.pendingAssistantGenerationId !== generationId
	) {
		return null;
	}

	const session = conversation.builderSessionId
		? await ctx.db.get(conversation.builderSessionId)
		: await ctx.db
				.query('builderSessions')
				.withIndex('by_conversationId', (q) => q.eq('conversationId', conversation._id))
				.unique();

	if (!session || isConversationExpired(session, now)) {
		return null;
	}

	return {
		assistantMessage,
		conversation,
		session
	};
}

export const startCustomEmailSession = mutation({
	args: {
		initialMessage: v.string()
	},
	handler: async (ctx, { initialMessage }) => {
		const now = Date.now();
		const normalizedInitialMessage = normalizeUserText(initialMessage);
		const card = await ctx.db
			.query('builderCards')
			.withIndex('by_slug_status', (q) =>
				q.eq('slug', CUSTOM_EMAIL_BUILDER_CARD_ID).eq('status', 'active')
			)
			.unique();

		if (!card) {
			throw new Error('Custom builder card not found.');
		}

		const expiresAt = getConversationExpiresAt(now);
		const conversationId = await ctx.db.insert('conversations', {
			cardId: card._id,
			cardSlug: card.slug,
			cardTitle: card.title,
			cardDescription: card.description,
			createdAt: now,
			updatedAt: now,
			expiresAt
		});
		const builderSessionId = await ctx.db.insert('builderSessions', {
			conversationId,
			cardId: card._id,
			cardSlug: card.slug,
			builderKind: 'custom',
			artifactKind: 'email',
			artifactVersion: 0,
			status: 'collecting',
			emailDraft: normalizeEmailDraft(createDefaultEmailDraft()),
			createdAt: now,
			updatedAt: now,
			expiresAt
		});

		await ctx.db.patch(conversationId, {
			builderSessionId,
			updatedAt: now
		});

		const userMessageId = await ctx.db.insert('messages', {
			conversationId,
			role: 'user',
			text: normalizedInitialMessage,
			status: 'complete',
			createdAt: now,
			updatedAt: now
		});
		const assistantMessageId = await insertPendingBuilderTurn(ctx, conversationId, now + 1);

		return {
			builderSessionId,
			conversationId,
			userMessageId,
			assistantMessageId
		};
	}
});

export const sendCustomEmailMessage = mutation({
	args: {
		builderSessionId: v.id('builderSessions'),
		text: v.string()
	},
	handler: async (ctx, { builderSessionId, text }) => {
		const now = Date.now();
		const normalizedText = normalizeUserText(text);
		const session = await ctx.db.get(builderSessionId);

		if (!session || isConversationExpired(session, now)) {
			throw new Error('Builder session not found.');
		}

		const conversation = await ctx.db.get(session.conversationId);

		if (!conversation || isConversationExpired(conversation, now)) {
			throw new Error('Conversation not found.');
		}

		if (conversation.pendingAssistantMessageId) {
			throw new Error('Please wait for the assistant response to finish before sending another message.');
		}

		const userMessageId = await ctx.db.insert('messages', {
			conversationId: conversation._id,
			role: 'user',
			text: normalizedText,
			status: 'complete',
			createdAt: now,
			updatedAt: now
		});
		const assistantMessageId = await insertPendingBuilderTurn(ctx, conversation._id, now + 1);

		return {
			builderSessionId,
			conversationId: conversation._id,
			userMessageId,
			assistantMessageId
		};
	}
});

export const saveUserEditedEmailDraft = mutation({
	args: {
		builderSessionId: v.id('builderSessions'),
		emailDraft: emailDraftValidator
	},
	handler: async (ctx, { builderSessionId, emailDraft: editedEmailDraft }) => {
		const now = Date.now();
		const session = await ctx.db.get(builderSessionId);

		if (!session || isConversationExpired(session, now)) {
			throw new Error('Builder session not found.');
		}

		const conversation = await ctx.db.get(session.conversationId);

		if (!conversation || isConversationExpired(conversation, now)) {
			throw new Error('Conversation not found.');
		}

		if (conversation.pendingAssistantMessageId) {
			throw new Error('Please wait for the assistant response to finish before editing the draft.');
		}

		const normalizedEmailDraft = normalizeEmailDraft(editedEmailDraft);
		const nextArtifactVersion = session.artifactVersion + 1;

		await ctx.db.patch(session._id, {
			artifactVersion: nextArtifactVersion,
			status: 'drafting',
			emailDraft: normalizedEmailDraft,
			updatedAt: now
		});

		const userMessageId = await ctx.db.insert('messages', {
			conversationId: conversation._id,
			role: 'user',
			text: 'I edited the email draft. Please polish typos, formatting, and light wording only. Preserve the meaning and do not add new facts.',
			status: 'complete',
			createdAt: now,
			updatedAt: now
		});
		const assistantMessageId = await insertPendingBuilderTurn(ctx, conversation._id, now + 1);

		return {
			builderSessionId,
			conversationId: conversation._id,
			userMessageId,
			assistantMessageId,
			artifactVersion: nextArtifactVersion
		};
	}
});

export const getSessionArtifact = query({
	args: {
		builderSessionId: v.id('builderSessions')
	},
	handler: async (ctx, { builderSessionId }) => {
		const session = await ctx.db.get(builderSessionId);

		if (!session || isConversationExpired(session)) {
			return null;
		}

		const conversation = await ctx.db.get(session.conversationId);

		return {
			builderSessionId: session._id,
			conversationId: session.conversationId,
			artifactVersion: session.artifactVersion,
			status: session.status,
			emailDraft: session.emailDraft,
			hasPendingAssistant: Boolean(conversation?.pendingAssistantMessageId)
		};
	}
});

export const getBuilderTurnContext = internalQuery({
	args: {
		conversationId: v.id('conversations')
	},
	handler: async (ctx, { conversationId }) => {
		const conversation = await ctx.db.get(conversationId);

		if (!conversation || isConversationExpired(conversation)) {
			return null;
		}

		const session: Doc<'builderSessions'> | null = conversation.builderSessionId
			? await ctx.db.get(conversation.builderSessionId)
			: await ctx.db
					.query('builderSessions')
					.withIndex('by_conversationId', (q) => q.eq('conversationId', conversation._id))
					.unique();

		if (!session || isConversationExpired(session)) {
			return null;
		}

		return {
			session,
			emailDraft: session.emailDraft,
			artifactVersion: session.artifactVersion
		};
	}
});

export const completeStreamingBuilderTurn = internalMutation({
	args: {
		assistantMessageId: v.id('messages'),
		generationId: v.string(),
		text: v.string(),
		previewUpdate: v.union(emailPreviewUpdate, v.null())
	},
	handler: async (ctx, { assistantMessageId, generationId, text, previewUpdate }) => {
		const now = Date.now();
		const activeTurn = await getActiveBuilderTurn(ctx, assistantMessageId, generationId, now);

		if (!activeTurn) {
			return;
		}

		if (previewUpdate) {
			if (previewUpdate.baseArtifactVersion !== activeTurn.session.artifactVersion) {
				throw new Error('Builder draft changed before the assistant response was applied.');
			}

			const emailDraft = applyEmailDraftPatch(activeTurn.session.emailDraft, previewUpdate.patch);
			const nextArtifactVersion = activeTurn.session.artifactVersion + 1;

			await ctx.db.patch(activeTurn.session._id, {
				artifactVersion: nextArtifactVersion,
				status: previewUpdate.status,
				emailDraft,
				updatedAt: now
			});
		}

		const assistantText = normalizeAssistantText(text);

		if (!assistantText) {
			throw new Error('Assistant response was empty.');
		}

		await ctx.db.patch(assistantMessageId, {
			text: assistantText,
			status: 'complete',
			updatedAt: now
		});

		await ctx.db.patch(activeTurn.conversation._id, {
			pendingAssistantMessageId: undefined,
			pendingAssistantGenerationId: undefined,
			updatedAt: now
		});
	}
});
