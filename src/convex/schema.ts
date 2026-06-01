import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { avatar } from '../backend/validators/avatars';
import {
	emailFormatBodyBlock,
	emailFormatBuilderMode,
	emailFormatRule,
	emailFormatSpreadsheetAttachment,
	emailFormatStatus
} from '../backend/validators/email-formats';

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
	emailFormats: defineTable({
		workspaceId: v.id('workspaces'),
		creatorUserId: v.id('users'),
		builderSlug: v.string(),
		builderMode: emailFormatBuilderMode,
		startingPointId: v.union(v.string(), v.null()),
		selectedAnswers: v.record(v.string(), v.string()),
		status: emailFormatStatus,
		title: v.string(),
		to: v.array(v.string()),
		cc: v.array(v.string()),
		attachment: v.union(emailFormatSpreadsheetAttachment, v.null()),
		body: v.array(emailFormatBodyBlock),
		emailDraftVersion: v.number(),
		recipientCount: v.number(),
		rules: v.array(emailFormatRule),
		linkedinContactsSummary: v.union(
			v.object({
				contactCount: v.number(),
				sourceFileName: v.string(),
				importedAt: v.number()
			}),
			v.null()
		),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_workspace_createdAt', ['workspaceId', 'createdAt']),
	emailFormatRecipients: defineTable({
		workspaceId: v.id('workspaces'),
		emailFormatId: v.id('emailFormats'),
		recipient: v.union(
			v.object({ kind: v.literal('user'), userId: v.id('users') }),
			v.object({ kind: v.literal('teammate'), teammateId: v.id('teammates') })
		),
		createdAt: v.number()
	})
		.index('by_emailFormat', ['emailFormatId'])
		.index('by_workspace_emailFormat', ['workspaceId', 'emailFormatId']),
	emailFormatLinkedinContacts: defineTable({
		workspaceId: v.id('workspaces'),
		emailFormatId: v.id('emailFormats'),
		firstName: v.string(),
		lastName: v.string(),
		fullName: v.string(),
		company: v.string(),
		position: v.string(),
		profileUrl: v.string(),
		email: v.string(),
		connectedOn: v.string(),
		sourceRowNumber: v.number(),
		createdAt: v.number()
	})
		.index('by_emailFormat', ['emailFormatId'])
		.index('by_workspace_emailFormat', ['workspaceId', 'emailFormatId'])
});
