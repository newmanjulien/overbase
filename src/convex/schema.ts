import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { avatar } from '../backend/validators/avatars';
import {
	emailFormatBodyBlock,
	emailFormatRule,
	emailFormatSpreadsheetAttachment,
	emailFormatStatus,
	emailFormatVariableDefinition
} from '../backend/validators/email-formats';

export default defineSchema({
	admins: defineTable({
		clerkUserId: v.string(),
		displayName: v.optional(v.string()),
		avatar: v.optional(avatar),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_clerkUserId', ['clerkUserId']),
	deletedClerkUsers: defineTable({
		clerkUserId: v.string(),
		deletedAt: v.number()
	}).index('by_clerkUserId', ['clerkUserId']),
	workspaces: defineTable({
		name: v.string(),
		industry: v.string(),
		avatar: v.optional(avatar),
		adminId: v.id('admins'),
		onboardingCompletedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_adminId', ['adminId']),
	teamMembers: defineTable({
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
		creatorAdminId: v.id('admins'),
		formatStarterSlug: v.string(),
		startingPointId: v.string(),
		variables: v.array(emailFormatVariableDefinition),
		selectedAnswers: v.record(v.string(), v.string()),
		status: emailFormatStatus,
		lastActivatedAt: v.union(v.number(), v.null()),
		title: v.string(),
		titleVersion: v.number(),
		to: v.array(v.string()),
		cc: v.array(v.string()),
		attachment: v.union(emailFormatSpreadsheetAttachment, v.null()),
		body: v.array(emailFormatBodyBlock),
		emailContentVersion: v.number(),
		recipientCount: v.number(),
		rules: v.array(emailFormatRule),
		rulesVersion: v.number(),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_workspace_createdAt', ['workspaceId', 'createdAt']),
	emailFormatRecipients: defineTable({
		workspaceId: v.id('workspaces'),
		emailFormatId: v.id('emailFormats'),
		recipient: v.union(
			v.object({ kind: v.literal('admin'), adminId: v.id('admins') }),
			v.object({ kind: v.literal('teamMember'), teamMemberId: v.id('teamMembers') })
		),
		createdAt: v.number()
	})
		.index('by_emailFormat', ['emailFormatId'])
		.index('by_workspace_emailFormat', ['workspaceId', 'emailFormatId'])
});
