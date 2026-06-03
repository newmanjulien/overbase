import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { avatar } from '../backend/validators/avatars';
import { createFormatGalleryCategoryId } from '../backend/validators/create-format-gallery';
import {
	externalDataSourceKind,
	externalDataSourceStatus,
	linkedinContactFields
} from '../backend/validators/external-data';
import {
	emailFormatBodyBlock,
	emailFormatRule,
	emailFormatSpreadsheetAttachment,
	emailFormatStatus,
	emailFormatVariableDefinition
} from '../backend/validators/email-formats';

export default defineSchema({
	users: defineTable({
		clerkUserId: v.string(),
		displayName: v.optional(v.string()),
		avatar: v.optional(avatar),
		workspaceId: v.optional(v.id('workspaces')),
		lastCreateFormatGalleryCategoryId: v.optional(createFormatGalleryCategoryId),
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
		formatDefinitionSlug: v.string(),
		createdFromStarterSlug: v.string(),
		variantSlug: v.string(),
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
			v.object({ kind: v.literal('user'), userId: v.id('users') }),
			v.object({ kind: v.literal('teammate'), teammateId: v.id('teammates') })
		),
		createdAt: v.number()
	})
		.index('by_emailFormat', ['emailFormatId'])
		.index('by_workspace_emailFormat', ['workspaceId', 'emailFormatId']),
	externalDataSources: defineTable({
		workspaceId: v.id('workspaces'),
		createdByUserId: v.id('users'),
		kind: externalDataSourceKind,
		name: v.string(),
		sourceFileName: v.string(),
		recordCount: v.number(),
		status: externalDataSourceStatus,
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_workspace_createdAt', ['workspaceId', 'createdAt'])
		.index('by_workspace_kind_createdAt', ['workspaceId', 'kind', 'createdAt']),
	externalDataSourceLinkedinContacts: defineTable({
		workspaceId: v.id('workspaces'),
		externalDataSourceId: v.id('externalDataSources'),
		...linkedinContactFields,
		createdAt: v.number()
	})
		.index('by_externalDataSource', ['externalDataSourceId'])
		.index('by_workspace_externalDataSource', ['workspaceId', 'externalDataSourceId']),
	emailFormatExternalDataLinks: defineTable({
		workspaceId: v.id('workspaces'),
		emailFormatId: v.id('emailFormats'),
		ruleId: v.string(),
		externalDataSourceId: v.id('externalDataSources'),
		createdAt: v.number()
	})
		.index('by_emailFormat', ['emailFormatId'])
		.index('by_workspace_emailFormat', ['workspaceId', 'emailFormatId'])
		.index('by_externalDataSource', ['externalDataSourceId'])
});
