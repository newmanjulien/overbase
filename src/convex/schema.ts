import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { emailDraft } from '../backend/validators/email-drafts';
import { avatar } from '../backend/validators/avatars';
import { emailFormatRecipientRef } from '../backend/validators/recipients';

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
	emailFormats: defineTable({
		workspaceId: v.id('workspaces'),
		title: v.string(),
		status: v.union(v.literal('paused'), v.literal('active')),
		emailDraft,
		emailDraftVersion: v.number(),
		rules: v.array(
			v.object({
				id: v.string(),
				text: v.string()
			})
		),
		recipientRefs: v.array(emailFormatRecipientRef),
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
	sentEmails: defineTable({
		workspaceId: v.id('workspaces'),
		emailFormatId: v.id('emailFormats'),
		sentAt: v.number(),
		emailDraft,
		createdAt: v.number()
	})
		.index('by_workspace_emailFormat_sentAt', [
			'workspaceId',
			'emailFormatId',
			'sentAt'
		])
		.index('by_workspace_emailFormat_createdAt', [
			'workspaceId',
			'emailFormatId',
			'createdAt'
		]),
	emailFeedback: defineTable({
		workspaceId: v.id('workspaces'),
		emailFormatId: v.id('emailFormats'),
		sentEmailId: v.id('sentEmails'),
		likedText: v.string(),
		improvementText: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_workspace_emailFormat', ['workspaceId', 'emailFormatId'])
		.index('by_workspace_sentEmail', ['workspaceId', 'sentEmailId'])
});
