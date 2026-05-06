import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { emailDraft, emailDraftChangedField } from './builderEmailValidators';

export const messageRole = v.union(v.literal('user'), v.literal('assistant'));
export const messageStatus = v.union(v.literal('complete'), v.literal('pending'), v.literal('failed'));
export const builderMode = v.literal('chat');
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
	})
		.index('by_slug', ['slug'])
		.index('by_sortOrder', ['sortOrder']),
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
		builderMode,
		resumeTokenHash: v.string(),
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
	builderTemplateGroups: defineTable({
		slug: v.string(),
		label: v.string(),
		description: v.string(),
		questionGuidance: v.string(),
		sortOrder: v.number(),
		status: v.union(v.literal('active'), v.literal('hidden'))
	})
		.index('by_slug', ['slug'])
		.index('by_status_sortOrder', ['status', 'sortOrder']),
	builderTemplates: defineTable({
		slug: v.string(),
		groupSlug: v.string(),
		label: v.string(),
		description: v.string(),
		matchSignals: v.array(v.string()),
		emailDraft,
		sortOrder: v.number(),
		status: v.union(v.literal('active'), v.literal('hidden'))
	})
		.index('by_slug', ['slug'])
		.index('by_group_status_sortOrder', ['groupSlug', 'status', 'sortOrder']),
	customEmailRuns: defineTable({
		cardId: v.id('builderCards'),
		builderSlug: v.string(),
		builderTitle: v.string(),
		artifactKind: v.literal('email'),
		artifactVersion: v.number(),
		phase: v.union(
			v.literal('routing'),
			v.literal('waitingForInitialAnswer'),
			v.literal('applyingInitialAnswer'),
			v.literal('ready'),
			v.literal('refining'),
			v.literal('failed')
		),
		artifactVisibility: v.union(v.literal('hidden'), v.literal('visible')),
		workingArtifactStatus: v.union(
			v.literal('none'),
			v.literal('preparing'),
			v.literal('ready'),
			v.literal('failed')
		),
		visibleArtifactStatus: v.union(
			v.literal('notReleased'),
			v.literal('ready'),
			v.literal('failed')
		),
		resumeTokenHash: v.string(),
		selectedTemplateGroupSlug: v.optional(v.string()),
		selectedTemplateSlug: v.optional(v.string()),
		activeMessageOperationId: v.optional(v.string()),
		activeArtifactOperationId: v.optional(v.string()),
		initialQuestionText: v.optional(v.string()),
		initialAnswerText: v.optional(v.string()),
		workingEmailDraft: v.optional(emailDraft),
		visibleEmailDraft: v.optional(emailDraft),
		errorText: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
		expiresAt: v.number()
	})
		.index('by_expiresAt', ['expiresAt']),
	customEmailMessages: defineTable({
		runId: v.id('customEmailRuns'),
		role: messageRole,
		text: v.string(),
		status: v.union(
			v.literal('pending'),
			v.literal('streaming'),
			v.literal('complete'),
			v.literal('failed')
		),
		operationId: v.optional(v.string()),
		errorText: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.optional(v.number())
	}).index('by_run_createdAt', ['runId', 'createdAt']),
	customEmailOperations: defineTable({
		runId: v.id('customEmailRuns'),
		kind: v.union(
			v.literal('routeAndAsk'),
			v.literal('prepareHiddenDraft'),
			v.literal('applyInitialAnswer'),
			v.literal('refine')
		),
		operationId: v.string(),
		status: v.union(
			v.literal('pending'),
			v.literal('running'),
			v.literal('complete'),
			v.literal('failed')
		),
		assistantMessageId: v.optional(v.id('customEmailMessages')),
		attempt: v.number(),
		maxAttempts: v.number(),
		deadlineAt: v.number(),
		errorText: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_run_createdAt', ['runId', 'createdAt'])
		.index('by_operationId', ['operationId']),
	customEmailEvents: defineTable({
		runId: v.id('customEmailRuns'),
		type: v.literal('artifactEditedByUser'),
		versionBefore: v.number(),
		versionAfter: v.number(),
		changedFields: v.array(emailDraftChangedField),
		summary: v.string(),
		createdAt: v.number()
	}).index('by_run_createdAt', ['runId', 'createdAt']),
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
