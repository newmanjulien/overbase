import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
	builderRunSetup,
	emailDraft,
	emailDraftState
} from './builderEmailValidators';

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
	opportunityFormats: defineTable({
		title: v.string(),
		status: v.union(v.literal('paused'), v.literal('active')),
		definition: v.object({
			kind: v.literal('customEmail'),
			builderAppSlug: v.string()
		}),
		emailDraft,
		emailDraftVersion: v.number(),
		rules: v.array(
			v.object({
				id: v.string(),
				text: v.string()
			})
		),
		teamMemberIds: v.array(v.string()),
		createdByName: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_createdAt', ['createdAt']),
	teamMembers: defineTable({
		email: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_email', ['email'])
		.index('by_createdAt', ['createdAt']),
	opportunities: defineTable({
		opportunityFormatId: v.id('opportunityFormats'),
		sentAt: v.number(),
		emailDraft,
		createdAt: v.number()
	})
		.index('by_opportunityFormat_sentAt', ['opportunityFormatId', 'sentAt'])
		.index('by_opportunityFormat_createdAt', ['opportunityFormatId', 'createdAt']),
	opportunityFeedback: defineTable({
		opportunityFormatId: v.id('opportunityFormats'),
		opportunityId: v.id('opportunities'),
		likedText: v.string(),
		improvementText: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_opportunityFormatId', ['opportunityFormatId'])
		.index('by_opportunityId', ['opportunityId'])
});
