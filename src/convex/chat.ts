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
import { streamChatReply } from './model';

const MAX_MESSAGE_LENGTH = 8_000;
const CONVERSATION_RETENTION_MS = 24 * 60 * 60 * 1000;
const EXPIRED_CONVERSATION_CLEANUP_LIMIT = 50;
const ASSISTANT_STREAM_FLUSH_INTERVAL_MS = 150;
const ASSISTANT_STREAM_FLUSH_MIN_CHARS = 120;

function createGenerationId() {
	return crypto.randomUUID();
}

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

async function getActiveAssistantTurn(
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

	return {
		assistantMessage,
		conversation
	};
}

async function insertPendingAssistantTurn(
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

	await ctx.scheduler.runAfter(0, internal.chat.generateAssistantReply, {
		conversationId,
		assistantMessageId,
		generationId
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

		if (conversation.pendingAssistantMessageId) {
			throw new Error('Please wait for the assistant response to finish before sending another message.');
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
		generationId: v.string(),
		text: v.string()
	},
	handler: async (ctx, { assistantMessageId, generationId, text }) => {
		const now = Date.now();
		const activeTurn = await getActiveAssistantTurn(ctx, assistantMessageId, generationId, now);

		if (!activeTurn) {
			return;
		}

		await ctx.db.patch(assistantMessageId, {
			text,
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

export const updateAssistantMessageDraft = internalMutation({
	args: {
		assistantMessageId: v.id('messages'),
		generationId: v.string(),
		text: v.string()
	},
	handler: async (ctx, { assistantMessageId, generationId, text }) => {
		const now = Date.now();
		const activeTurn = await getActiveAssistantTurn(ctx, assistantMessageId, generationId, now);

		if (!activeTurn) {
			return;
		}

		await ctx.db.patch(assistantMessageId, {
			text,
			updatedAt: now
		});

		await ctx.db.patch(activeTurn.conversation._id, {
			updatedAt: now
		});
	}
});

export const failAssistantMessage = internalMutation({
	args: {
		assistantMessageId: v.id('messages'),
		generationId: v.string(),
		text: v.string(),
		errorText: v.optional(v.string())
	},
	handler: async (ctx, { assistantMessageId, generationId, text, errorText }) => {
		const now = Date.now();
		const activeTurn = await getActiveAssistantTurn(ctx, assistantMessageId, generationId, now);

		if (!activeTurn) {
			return;
		}

		await ctx.db.patch(
			assistantMessageId,
			errorText
				? {
						text,
						errorText,
						status: 'failed',
						updatedAt: now
					}
				: {
						text,
						status: 'failed',
						updatedAt: now
					}
		);

		await ctx.db.patch(activeTurn.conversation._id, {
			pendingAssistantMessageId: undefined,
			pendingAssistantGenerationId: undefined,
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
		assistantMessageId: v.id('messages'),
		generationId: v.string()
	},
	handler: async (ctx, { conversationId, assistantMessageId, generationId }) => {
		const startedAt = Date.now();
		let firstTokenAt: number | null = null;
		let draftText = '';
		let flushedText = '';
		let lastFlushAt = 0;
		let flushCount = 0;

		async function flushDraft(force = false) {
			if (draftText === flushedText) {
				return;
			}

			const now = Date.now();
			const hasEnoughText = draftText.length - flushedText.length >= ASSISTANT_STREAM_FLUSH_MIN_CHARS;
			const hasWaited = now - lastFlushAt >= ASSISTANT_STREAM_FLUSH_INTERVAL_MS;

			if (!force && !hasEnoughText && !hasWaited) {
				return;
			}

			flushedText = draftText;
			lastFlushAt = now;
			flushCount += 1;

			await ctx.runMutation(internal.chat.updateAssistantMessageDraft, {
				assistantMessageId,
				generationId,
				text: flushedText
			});
		}

		try {
			const transcript = await ctx.runQuery(internal.chat.getTranscript, { conversationId });

			if (transcript.length === 0) {
				await ctx.runMutation(internal.chat.failAssistantMessage, {
					assistantMessageId,
					generationId,
					text: 'No conversation transcript was available.'
				});
				return;
			}

			const reply = await streamChatReply(transcript, {
				onDelta: async (delta) => {
					if (firstTokenAt === null) {
						firstTokenAt = Date.now();
					}

					draftText += delta;
					await flushDraft();
				}
			});

			await flushDraft(true);

			await ctx.runMutation(internal.chat.completeAssistantMessage, {
				assistantMessageId,
				generationId,
				text: reply
			});

			const completedAt = Date.now();
			console.log('chat.generateAssistantReply completed', {
				conversationId,
				assistantMessageId,
				generationId,
				timeToFirstTokenMs: firstTokenAt === null ? null : firstTokenAt - startedAt,
				totalDurationMs: completedAt - startedAt,
				flushCount,
				finalCharacterCount: reply.length
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'AI reply generation failed.';
			const hasPartialText = draftText.trim().length > 0;
			const failedText = hasPartialText ? draftText : message;

			await ctx.runMutation(
				internal.chat.failAssistantMessage,
				hasPartialText
					? {
							assistantMessageId,
							generationId,
							text: failedText,
							errorText: message
						}
					: {
							assistantMessageId,
							generationId,
							text: failedText
						}
			);

			const failedAt = Date.now();
			console.error('chat.generateAssistantReply failed', {
				conversationId,
				assistantMessageId,
				generationId,
				timeToFirstTokenMs: firstTokenAt === null ? null : firstTokenAt - startedAt,
				totalDurationMs: failedAt - startedAt,
				flushCount,
				partialCharacterCount: draftText.length,
				error: message
			});
		}
	}
});
