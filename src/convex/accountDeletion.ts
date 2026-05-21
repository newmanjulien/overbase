import { v } from 'convex/values';
import { internalMutation } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import type { StoredAvatar } from './avatar';

async function deleteUploadedAvatar(ctx: MutationCtx, avatar: StoredAvatar | undefined) {
	if (avatar?.storageId) {
		const metadata = await ctx.db.system.get(avatar.storageId);

		if (metadata) {
			await ctx.storage.delete(avatar.storageId);
		}
	}
}

async function deleteBuilderSessionRecords(ctx: MutationCtx, workspaceId: Id<'workspaces'>) {
	const sessions = await ctx.db
		.query('builderSessions')
		.withIndex('by_workspace_app_startRequestId', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	for (const session of sessions) {
		const [messages, jobs] = await Promise.all([
			ctx.db
				.query('builderSessionMessages')
				.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
				.collect(),
			ctx.db
				.query('builderSessionJobs')
				.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
				.collect()
		]);

		for (const message of messages) {
			await ctx.db.delete(message._id);
		}

		for (const job of jobs) {
			await ctx.db.delete(job._id);
		}

		await ctx.db.delete(session._id);
	}
}

async function deleteOpportunityRecords(ctx: MutationCtx, workspaceId: Id<'workspaces'>) {
	const [feedback, opportunities, opportunityFormats] = await Promise.all([
		ctx.db
			.query('opportunityFeedback')
			.withIndex('by_workspace_opportunityFormat', (q) => q.eq('workspaceId', workspaceId))
			.collect(),
		ctx.db
			.query('opportunities')
			.withIndex('by_workspace_opportunityFormat_createdAt', (q) =>
				q.eq('workspaceId', workspaceId)
			)
			.collect(),
		ctx.db
			.query('opportunityFormats')
			.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspaceId))
			.collect()
	]);

	for (const feedbackItem of feedback) {
		await ctx.db.delete(feedbackItem._id);
	}

	for (const opportunity of opportunities) {
		await ctx.db.delete(opportunity._id);
	}

	for (const opportunityFormat of opportunityFormats) {
		await ctx.db.delete(opportunityFormat._id);
	}
}

async function deleteTeammateRecords(ctx: MutationCtx, workspaceId: Id<'workspaces'>) {
	const teammates = await ctx.db
		.query('teammates')
		.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	for (const teammate of teammates) {
		await ctx.db.delete(teammate._id);
	}
}

async function deleteWorkspaceRecords(ctx: MutationCtx, workspace: Doc<'workspaces'>) {
	await deleteBuilderSessionRecords(ctx, workspace._id);
	await deleteOpportunityRecords(ctx, workspace._id);
	await deleteTeammateRecords(ctx, workspace._id);
	await deleteUploadedAvatar(ctx, workspace.avatar);
	await ctx.db.delete(workspace._id);
}

async function getOwnedWorkspaces(ctx: MutationCtx, user: Doc<'users'>) {
	const workspaces = await ctx.db
		.query('workspaces')
		.withIndex('by_ownerUserId', (q) => q.eq('ownerUserId', user._id))
		.collect();

	if (!user.workspaceId) {
		return workspaces;
	}

	const linkedWorkspace = await ctx.db.get(user.workspaceId);

	if (!linkedWorkspace || linkedWorkspace.ownerUserId !== user._id) {
		return workspaces;
	}

	return workspaces.some((workspace) => workspace._id === linkedWorkspace._id)
		? workspaces
		: [...workspaces, linkedWorkspace];
}

async function deleteAccountRecords(ctx: MutationCtx, user: Doc<'users'>) {
	const workspaces = await getOwnedWorkspaces(ctx, user);

	for (const workspace of workspaces) {
		await deleteWorkspaceRecords(ctx, workspace);
	}

	await deleteUploadedAvatar(ctx, user.avatar);
	await ctx.db.delete(user._id);
}

export const deleteAccountForClerkUser = internalMutation({
	args: {
		clerkUserId: v.string()
	},
	handler: async (ctx, { clerkUserId }) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', clerkUserId))
			.first();

		if (!user) {
			return { ok: true };
		}

		await deleteAccountRecords(ctx, user);

		return { ok: true };
	}
});
