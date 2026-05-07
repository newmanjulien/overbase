import { v } from 'convex/values';
import { internal } from './_generated/api';
import {
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
	type MutationCtx,
	type QueryCtx
} from './_generated/server';
import type { Id } from './_generated/dataModel';
import { builderMode } from './schema';
import { streamChatReply } from './model';
import {
	createResumeToken,
	createGenerationId,
	getConversationExpiresAt,
	hashResumeToken,
	isConversationActive,
	normalizeUserText,
	verifyResumeToken
} from './conversationCore';

const EXPIRED_CONVERSATION_CLEANUP_LIMIT = 50;
const ASSISTANT_STREAM_FLUSH_INTERVAL_MS = 150;
const ASSISTANT_STREAM_FLUSH_MIN_CHARS = 120;

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

	if (!conversation || !isConversationActive(conversation, now)) {
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

async function getResumeAuthorizedConversation(
	ctx: QueryCtx | MutationCtx,
	{
		conversationId,
		resumeToken,
		blueprintSlug,
		builderMode: expectedBuilderMode
	}: {
		conversationId: Id<'conversations'>;
		resumeToken: string;
		blueprintSlug?: string;
		builderMode?: 'chat';
	},
	now = Date.now()
) {
	const conversation = await ctx.db.get(conversationId);

	if (!conversation || !isConversationActive(conversation, now)) {
		return null;
	}

	if (blueprintSlug !== undefined && conversation.blueprintSlug !== blueprintSlug) {
		return null;
	}

	if (expectedBuilderMode !== undefined && conversation.builderMode !== expectedBuilderMode) {
		return null;
	}

	if (!(await verifyResumeToken(conversation, resumeToken))) {
		return null;
	}

	return conversation;
}

async function deleteConversationTree(ctx: MutationCtx, conversationId: Id<'conversations'>) {
	const messages = await ctx.db
		.query('messages')
		.withIndex('by_conversation_createdAt', (q) => q.eq('conversationId', conversationId))
		.collect();

	for (const message of messages) {
		await ctx.db.delete(message._id);
	}

	await ctx.db.delete(conversationId);

	return {
		deletedMessages: messages.length
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
		blueprintSlug: v.string(),
		initialMessage: v.string()
	},
	handler: async (ctx, { blueprintSlug, initialMessage }) => {
		const now = Date.now();
		const normalizedInitialMessage = normalizeUserText(initialMessage);
		const resumeToken = createResumeToken();
		const resumeTokenHash = await hashResumeToken(resumeToken);
		const expiresAt = getConversationExpiresAt(now);
		const blueprint = await ctx.db
			.query('builderBlueprints')
			.withIndex('by_slug_status', (q) => q.eq('slug', blueprintSlug).eq('status', 'active'))
			.unique();

		if (!blueprint) {
			throw new Error('Builder blueprint not found.');
		}

		const conversationId = await ctx.db.insert('conversations', {
			blueprintId: blueprint._id,
			blueprintSlug: blueprint.slug,
			blueprintTitle: blueprint.title,
			blueprintDescription: blueprint.description,
			builderMode: 'chat',
			resumeTokenHash,
			createdAt: now,
			updatedAt: now,
			expiresAt
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
			builderMode: 'chat' as const,
			resumeToken,
			expiresAt,
			userMessageId,
			assistantMessageId
		};
	}
});

export const listMessages = query({
	args: {
		conversationId: v.id('conversations'),
		resumeToken: v.string()
	},
	handler: async (ctx, { conversationId, resumeToken }) => {
		const conversation = await getResumeAuthorizedConversation(ctx, { conversationId, resumeToken });

		if (!conversation) {
			return [];
		}

		return await ctx.db
			.query('messages')
			.withIndex('by_conversation_createdAt', (q) => q.eq('conversationId', conversation._id))
			.collect();
	}
});

export const resumeConversation = mutation({
	args: {
		conversationId: v.id('conversations'),
		resumeToken: v.string(),
		blueprintSlug: v.string(),
		builderMode
	},
	handler: async (ctx, { conversationId, resumeToken, blueprintSlug, builderMode }) => {
		const now = Date.now();
		const conversation = await getResumeAuthorizedConversation(
			ctx,
			{
				conversationId,
				resumeToken,
				blueprintSlug,
				builderMode
			},
			now
		);

		if (!conversation) {
			return null;
		}

		const expiresAt = getConversationExpiresAt(now);

		await ctx.db.patch(conversation._id, {
			expiresAt,
			updatedAt: now
		});

		return {
			conversationId: conversation._id,
			builderMode,
			resumeToken,
			expiresAt
		};
	}
});

export const disposeConversation = mutation({
	args: {
		conversationId: v.id('conversations'),
		resumeToken: v.string()
	},
	handler: async (ctx, { conversationId, resumeToken }) => {
		const conversation = await ctx.db.get(conversationId);

		if (!conversation || !(await verifyResumeToken(conversation, resumeToken))) {
			return {
				disposed: false,
				deletedMessages: 0
			};
		}

		const deleted = await deleteConversationTree(ctx, conversation._id);

		return {
			disposed: true,
			...deleted
		};
	}
});

export const sendMessage = mutation({
	args: {
		conversationId: v.id('conversations'),
		resumeToken: v.string(),
		text: v.string()
	},
	handler: async (ctx, { conversationId, resumeToken, text }) => {
		const now = Date.now();
		const normalizedText = normalizeUserText(text);
		const conversation = await getResumeAuthorizedConversation(ctx, {
			conversationId,
			resumeToken,
			builderMode: 'chat'
		});

		if (!conversation) {
			throw new Error('Conversation not found.');
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
		const expiresAt = getConversationExpiresAt(now);

		await ctx.db.patch(conversationId, {
			expiresAt,
			updatedAt: now + 1
		});

		return {
			expiresAt,
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

		if (!conversation || !isConversationActive(conversation)) {
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
			updatedAt: now,
			expiresAt: getConversationExpiresAt(now)
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
			updatedAt: now,
			expiresAt: getConversationExpiresAt(now)
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
			updatedAt: now,
			expiresAt: getConversationExpiresAt(now)
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
			const deleted = await deleteConversationTree(ctx, conversation._id);
			deletedMessages += deleted.deletedMessages;
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
		let draftText = '';
		let flushedText = '';
		let lastFlushAt = 0;

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
		}
	}
});
