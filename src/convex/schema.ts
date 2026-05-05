import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const messageRole = v.union(v.literal('user'), v.literal('assistant'));
export const messageStatus = v.union(v.literal('complete'), v.literal('pending'), v.literal('failed'));

export default defineSchema({
	conversations: defineTable({
		cardId: v.string(),
		cardTitle: v.string(),
		cardDescription: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	}),
	messages: defineTable({
		conversationId: v.id('conversations'),
		role: messageRole,
		text: v.string(),
		status: messageStatus,
		createdAt: v.number(),
		updatedAt: v.optional(v.number())
	}).index('by_conversation_createdAt', ['conversationId', 'createdAt'])
});
