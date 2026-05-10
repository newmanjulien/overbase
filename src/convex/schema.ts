import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { builderRunSetup, emailDraftState } from './builderEmailValidators';

export const messageRole = v.union(v.literal('user'), v.literal('assistant'));

export default defineSchema({
	builderSessions: defineTable({
		appSlug: v.string(),
		appTitle: v.string(),
		startRequestId: v.optional(v.string()),
		setup: builderRunSetup,
		status: v.union(
			v.literal('working'),
			v.literal('waitingForUser'),
			v.literal('ready'),
			v.literal('failed')
		),
		resumeTokenHash: v.string(),
		appState: v.optional(
			v.object({
				version: v.number(),
				value: v.any()
			})
		),
		activeTurnJobId: v.optional(v.id('builderSessionJobs')),
		activeBackgroundJobId: v.optional(v.id('builderSessionJobs')),
		emailDraftState: v.optional(emailDraftState),
		errorText: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
		expiresAt: v.number()
	})
		.index('by_expiresAt', ['expiresAt'])
		.index('by_app_startRequestId', ['appSlug', 'startRequestId']),
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
		jobId: v.optional(v.id('builderSessionJobs')),
		errorText: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.optional(v.number())
	}).index('by_session_createdAt', ['sessionId', 'createdAt']),
	builderSessionJobs: defineTable({
		sessionId: v.id('builderSessions'),
		kind: v.union(
			v.literal('startTurn'),
			v.literal('continueTurn'),
			v.literal('background')
		),
		status: v.union(
			v.literal('pending'),
			v.literal('running'),
			v.literal('complete'),
			v.literal('failed')
		),
		assistantMessageId: v.optional(v.id('builderSessionMessages')),
		attempts: v.number(),
		deadlineAt: v.number(),
		errorText: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_session_createdAt', ['sessionId', 'createdAt']),
});
