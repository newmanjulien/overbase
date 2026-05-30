import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx } from '../../convex/_generated/server';
import { deleteEmailFormatRecordsForWorkspace } from '../email-formats/deletion';
import { deleteUploadedAvatar } from '../profiles/avatars';

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
	await deleteEmailFormatRecordsForWorkspace(ctx, workspace._id);
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

export async function deleteAccountForClerkUserId(ctx: MutationCtx, clerkUserId: string) {
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
