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
		cardId: v.string(),
		cardTitle: v.string(),
		cardDescription: v.string(),
		initialMessage: v.string()
	},
	handler: async (ctx, { cardId, cardTitle, cardDescription, initialMessage }) => {
		const now = Date.now();
		const normalizedInitialMessage = normalizeUserText(initialMessage);

		const conversationId = await ctx.db.insert('conversations', {
			cardId,
			cardTitle,
			cardDescription,
			createdAt: now,
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

		if (!conversation) {
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

		if (!assistantMessage || assistantMessage.role !== 'assistant') {
			throw new Error('Assistant message not found.');
		}

		const now = Date.now();

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

		if (!assistantMessage || assistantMessage.role !== 'assistant') {
			throw new Error('Assistant message not found.');
		}

		const now = Date.now();

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

export const generateAssistantReply = internalAction({
	args: {
		conversationId: v.id('conversations'),
		assistantMessageId: v.id('messages')
	},
	handler: async (ctx, { conversationId, assistantMessageId }) => {
		try {
			const transcript = await ctx.runQuery(internal.chat.getTranscript, { conversationId });
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
