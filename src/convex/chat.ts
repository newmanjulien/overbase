import { v } from 'convex/values';
import { internal } from './_generated/api';
import {
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
	type MutationCtx
} from './_generated/server';
import type { Id } from './_generated/dataModel';
import { generateChatReply } from './model';

const MAX_MESSAGE_LENGTH = 8_000;
const CONVERSATION_RETENTION_MS = 24 * 60 * 60 * 1000;
const EXPIRED_CONVERSATION_CLEANUP_LIMIT = 50;

function normalizeUserText(text: string) {
	const normalized = text.trim();

	if (!normalized) {
		throw new Error('Message text is required.');
	}

	if (normalized.length > MAX_MESSAGE_LENGTH) {
		throw new Error(`Message text must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
	}

	return normalized;
}

function getConversationExpiresAt(createdAt: number) {
	return createdAt + CONVERSATION_RETENTION_MS;
}

function isConversationExpired(conversation: { expiresAt: number }, now = Date.now()) {
	return conversation.expiresAt <= now;
}

async function insertPendingAssistantTurn(
	ctx: MutationCtx,
	conversationId: Id<'conversations'>,
	createdAt: number
) {
	const assistantMessageId = await ctx.db.insert('messages', {
		conversationId,
		role: 'assistant',
		text: '',
		status: 'pending',
		createdAt,
		updatedAt: createdAt
	});

	await ctx.scheduler.runAfter(0, internal.chat.generateAssistantReply, {
		conversationId,
		assistantMessageId
	});

	return assistantMessageId;
}

export const startConversation = mutation({
	args: {
		cardSlug: v.string(),
		initialMessage: v.string()
	},
	handler: async (ctx, { cardSlug, initialMessage }) => {
		const now = Date.now();
		const normalizedInitialMessage = normalizeUserText(initialMessage);
		const card = await ctx.db
			.query('builderCards')
			.withIndex('by_slug_status', (q) => q.eq('slug', cardSlug).eq('status', 'active'))
			.unique();

		if (!card) {
			throw new Error('Builder card not found.');
		}

		const conversationId = await ctx.db.insert('conversations', {
			cardId: card._id,
			cardSlug: card.slug,
			cardTitle: card.title,
			cardDescription: card.description,
			createdAt: now,
			updatedAt: now,
			expiresAt: getConversationExpiresAt(now)
		});

		const userMessageId = await ctx.db.insert('messages', {
			conversationId,
			role: 'user',
			text: normalizedInitialMessage,
			status: 'complete',
			createdAt: now,
			updatedAt: now
		});

		const assistantMessageId = await insertPendingAssistantTurn(ctx, conversationId, now + 1);

		return {
			conversationId,
			userMessageId,
			assistantMessageId
		};
	}
});

export const listMessages = query({
	args: {
		conversationId: v.id('conversations')
	},
	handler: async (ctx, { conversationId }) => {
		const conversation = await ctx.db.get(conversationId);

		if (!conversation || isConversationExpired(conversation)) {
			return [];
		}

		return await ctx.db
			.query('messages')
			.withIndex('by_conversation_createdAt', (q) => q.eq('conversationId', conversation._id))
			.collect();
	}
});

export const sendMessage = mutation({
	args: {
		conversationId: v.id('conversations'),
		text: v.string()
	},
	handler: async (ctx, { conversationId, text }) => {
		const now = Date.now();
		const normalizedText = normalizeUserText(text);
		const conversation = await ctx.db.get(conversationId);

		if (!conversation) {
			throw new Error('Conversation not found.');
		}

		if (isConversationExpired(conversation, now)) {
			throw new Error('Conversation expired.');
		}

		const userMessageId = await ctx.db.insert('messages', {
			conversationId,
			role: 'user',
			text: normalizedText,
			status: 'complete',
			createdAt: now,
			updatedAt: now
		});

		const assistantMessageId = await insertPendingAssistantTurn(ctx, conversationId, now + 1);

		await ctx.db.patch(conversationId, {
			updatedAt: now
		});

		return {
			conversationId,
			userMessageId,
			assistantMessageId
		};
	}
});

export const getTranscript = internalQuery({
	args: {
		conversationId: v.id('conversations')
	},
	handler: async (ctx, { conversationId }) => {
		const conversation = await ctx.db.get(conversationId);

		if (!conversation || isConversationExpired(conversation)) {
			return [];
		}

		const messages = await ctx.db
			.query('messages')
			.withIndex('by_conversation_createdAt', (q) => q.eq('conversationId', conversationId))
			.collect();

		return messages
			.filter((message) => message.status === 'complete')
			.map((message) => ({
				role: message.role,
				text: message.text
			}));
	}
});

export const completeAssistantMessage = internalMutation({
	args: {
		assistantMessageId: v.id('messages'),
		text: v.string()
	},
	handler: async (ctx, { assistantMessageId, text }) => {
		const assistantMessage = await ctx.db.get(assistantMessageId);

		if (!assistantMessage) {
			return;
		}

		if (assistantMessage.role !== 'assistant') {
			throw new Error('Assistant message not found.');
		}

		const now = Date.now();
		const conversation = await ctx.db.get(assistantMessage.conversationId);

		if (!conversation || isConversationExpired(conversation, now)) {
			return;
		}

		await ctx.db.patch(assistantMessageId, {
			text,
			status: 'complete',
			updatedAt: now
		});

		await ctx.db.patch(assistantMessage.conversationId, {
			updatedAt: now
		});
	}
});

export const failAssistantMessage = internalMutation({
	args: {
		assistantMessageId: v.id('messages'),
		text: v.string()
	},
	handler: async (ctx, { assistantMessageId, text }) => {
		const assistantMessage = await ctx.db.get(assistantMessageId);

		if (!assistantMessage) {
			return;
		}

		if (assistantMessage.role !== 'assistant') {
			throw new Error('Assistant message not found.');
		}

		const now = Date.now();
		const conversation = await ctx.db.get(assistantMessage.conversationId);

		if (!conversation || isConversationExpired(conversation, now)) {
			return;
		}

		await ctx.db.patch(assistantMessageId, {
			text,
			status: 'failed',
			updatedAt: now
		});

		await ctx.db.patch(assistantMessage.conversationId, {
			updatedAt: now
		});
	}
});

export const deleteExpiredConversations = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		const conversations = await ctx.db
			.query('conversations')
			.withIndex('by_expiresAt', (q) => q.lte('expiresAt', now))
			.take(EXPIRED_CONVERSATION_CLEANUP_LIMIT);
		let deletedMessages = 0;

		for (const conversation of conversations) {
			const messages = await ctx.db
				.query('messages')
				.withIndex('by_conversation_createdAt', (q) => q.eq('conversationId', conversation._id))
				.collect();

			for (const message of messages) {
				await ctx.db.delete(message._id);
				deletedMessages += 1;
			}

			await ctx.db.delete(conversation._id);
		}

		return {
			deletedConversations: conversations.length,
			deletedMessages
		};
	}
});

export const generateAssistantReply = internalAction({
	args: {
		conversationId: v.id('conversations'),
		assistantMessageId: v.id('messages')
	},
	handler: async (ctx, { conversationId, assistantMessageId }) => {
		try {
			const transcript = await ctx.runQuery(internal.chat.getTranscript, { conversationId });

			if (transcript.length === 0) {
				return;
			}

			const reply = await generateChatReply(transcript);

			await ctx.runMutation(internal.chat.completeAssistantMessage, {
				assistantMessageId,
				text: reply
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'AI reply generation failed.';

			await ctx.runMutation(internal.chat.failAssistantMessage, {
				assistantMessageId,
				text: message
			});
		}
	}
});
