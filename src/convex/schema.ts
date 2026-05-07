import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { emailDraft, emailDraftChangedField } from './emailDesignValidators';

export const messageRole = v.union(v.literal('user'), v.literal('assistant'));

export default defineSchema({
	builderSessions: defineTable({
		appSlug: v.string(),
		appTitle: v.string(),
		artifactKind: v.literal('email'),
		artifactVersion: v.number(),
		phase: v.union(
			v.literal('routing'),
			v.literal('waitingForInitialAnswer'),
			v.literal('applyingInitialAnswer'),
			v.literal('preparingInitialDraft'),
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
		selectedEmailExamplesSlug: v.optional(v.string()),
		selectedEmailExampleSlug: v.optional(v.string()),
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
	builderSessionMessages: defineTable({
		sessionId: v.id('builderSessions'),
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
	}).index('by_session_createdAt', ['sessionId', 'createdAt']),
	builderSessionJobs: defineTable({
		sessionId: v.id('builderSessions'),
		kind: v.union(
			v.literal('routeAndAsk'),
			v.literal('prepareHiddenDraft'),
			v.literal('prepareInitialDraft'),
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
		assistantMessageId: v.optional(v.id('builderSessionMessages')),
		attempt: v.number(),
		maxAttempts: v.number(),
		deadlineAt: v.number(),
		errorText: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_session_createdAt', ['sessionId', 'createdAt'])
		.index('by_operationId', ['operationId']),
	builderSessionEvents: defineTable({
		sessionId: v.id('builderSessions'),
		type: v.literal('artifactEditedByUser'),
		versionBefore: v.number(),
		versionAfter: v.number(),
		changedFields: v.array(emailDraftChangedField),
		summary: v.string(),
		createdAt: v.number()
	}).index('by_session_createdAt', ['sessionId', 'createdAt'])
});
