import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { avatar } from '../backend/validators/avatars';

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
		.index('by_workspace_createdAt', ['workspaceId', 'createdAt'])
});
