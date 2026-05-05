import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const messageRole = v.union(v.literal('user'), v.literal('assistant'));
export const messageStatus = v.union(v.literal('complete'), v.literal('pending'), v.literal('failed'));
export const builderGuideQuestion = v.union(
	v.object({
		id: v.string(),
		type: v.literal('choice'),
		title: v.string(),
		options: v.array(v.string()),
		customAnswerPlaceholder: v.string()
	}),
	v.object({
		id: v.string(),
		type: v.literal('text'),
		title: v.string(),
		placeholder: v.string()
	})
);

export default defineSchema({
	builderCategories: defineTable({
		slug: v.string(),
		label: v.string(),
		iconId: v.string(),
		sortOrder: v.number()
	}).index('by_slug', ['slug']).index('by_sortOrder', ['sortOrder']),
		builderArtworkPresets: defineTable({
			slug: v.string(),
			card: v.object({
				tone: v.union(v.literal('coral'), v.literal('violet'), v.literal('aqua'), v.literal('zinc')),
				iconId: v.string(),
				symbolSize: v.union(v.literal('sm'), v.literal('md'))
			}),
			blueprint: v.object({
				backColor: v.string(),
				frontColor: v.string(),
				iconId: v.string(),
				iconCenterX: v.string(),
				iconCenterY: v.string()
			})
		}).index('by_slug', ['slug']),
		builderCards: defineTable({
			slug: v.string(),
			categoryIds: v.array(v.string()),
			title: v.string(),
			description: v.string(),
			artworkPresetSlug: v.string(),
			isTemplate: v.boolean(),
			sortOrder: v.number(),
			status: v.union(v.literal('active'), v.literal('hidden'))
	})
		.index('by_slug', ['slug'])
		.index('by_slug_status', ['slug', 'status'])
		.index('by_template_status_sortOrder', ['isTemplate', 'status', 'sortOrder']),
	builderGuides: defineTable({
		cardSlug: v.string(),
		intro: v.string(),
		questions: v.array(builderGuideQuestion)
	}).index('by_cardSlug', ['cardSlug']),
	conversations: defineTable({
		cardId: v.id('builderCards'),
		cardSlug: v.string(),
		cardTitle: v.string(),
		cardDescription: v.string(),
			ownerUserId: v.optional(v.string()),
			organizationId: v.optional(v.string()),
			pendingAssistantMessageId: v.optional(v.id('messages')),
			pendingAssistantGenerationId: v.optional(v.string()),
			createdAt: v.number(),
			updatedAt: v.number(),
			expiresAt: v.number()
	})
		.index('by_updatedAt', ['updatedAt'])
		.index('by_expiresAt', ['expiresAt'])
		.index('by_organization_updatedAt', ['organizationId', 'updatedAt']),
	messages: defineTable({
		conversationId: v.id('conversations'),
		role: messageRole,
		text: v.string(),
		status: messageStatus,
		generationId: v.optional(v.string()),
		errorText: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.optional(v.number())
	}).index('by_conversation_createdAt', ['conversationId', 'createdAt'])
});
