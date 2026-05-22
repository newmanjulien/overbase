import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
	builderArtifacts,
	builderRunSetup
} from '../backend/validators/builder-protocol';
import { emailDraft } from '../backend/validators/email-drafts';
import { avatar } from '../backend/validators/avatars';
import { formatRecipientRef } from '../backend/validators/recipients';

export const messageRole = v.union(v.literal('user'), v.literal('assistant'));

export default defineSchema({
	users: defineTable({
		clerkUserId: v.string(),
		displayName: v.optional(v.string()),
		avatar: v.optional(avatar),
		workspaceId: v.optional(v.id('workspaces')),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_clerkUserId', ['clerkUserId']),
	workspaces: defineTable({
		name: v.string(),
		website: v.string(),
		avatar: v.optional(avatar),
		ownerUserId: v.id('users'),
		onboardingCompletedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_ownerUserId', ['ownerUserId']),
	builderSessions: defineTable({
		workspaceId: v.id('workspaces'),
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
		appState: v.optional(
			v.object({
				version: v.number(),
				value: v.any()
			})
		),
		activeTurnJobId: v.optional(v.id('builderSessionJobs')),
		activeBackgroundJobId: v.optional(v.id('builderSessionJobs')),
		artifacts: builderArtifacts,
		errorText: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
		expiresAt: v.number()
	})
		.index('by_expiresAt', ['expiresAt'])
		.index('by_workspace_app_startRequestId', ['workspaceId', 'appSlug', 'startRequestId']),
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
		workspaceId: v.id('workspaces'),
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
		recipientRefs: v.array(formatRecipientRef),
		createdByUserId: v.id('users'),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_workspace_createdAt', ['workspaceId', 'createdAt'])
		.index('by_createdByUserId', ['createdByUserId']),
	teammates: defineTable({
		workspaceId: v.id('workspaces'),
		email: v.string(),
		name: v.string(),
		role: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_workspace_email', ['workspaceId', 'email'])
		.index('by_workspace_createdAt', ['workspaceId', 'createdAt']),
	opportunities: defineTable({
		workspaceId: v.id('workspaces'),
		opportunityFormatId: v.id('opportunityFormats'),
		sentAt: v.number(),
		emailDraft,
		createdAt: v.number()
	})
		.index('by_workspace_opportunityFormat_sentAt', [
			'workspaceId',
			'opportunityFormatId',
			'sentAt'
		])
		.index('by_workspace_opportunityFormat_createdAt', [
			'workspaceId',
			'opportunityFormatId',
			'createdAt'
		]),
	opportunityFeedback: defineTable({
		workspaceId: v.id('workspaces'),
		opportunityFormatId: v.id('opportunityFormats'),
		opportunityId: v.id('opportunities'),
		likedText: v.string(),
		improvementText: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_workspace_opportunityFormat', ['workspaceId', 'opportunityFormatId'])
		.index('by_workspace_opportunity', ['workspaceId', 'opportunityId'])
});
