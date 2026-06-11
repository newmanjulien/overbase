import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx } from '../../convex/_generated/server';
import { deleteUploadedAvatar } from '../profiles/avatars';

async function deleteEmailFormatRecipientRecords(ctx: MutationCtx, workspaceId: Id<'workspaces'>) {
	const recipients = await ctx.db
		.query('emailFormatRecipients')
		.withIndex('by_workspace_emailFormat', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	for (const recipient of recipients) {
		await ctx.db.delete(recipient._id);
	}
}

async function deleteEmailFormatRecords(ctx: MutationCtx, workspaceId: Id<'workspaces'>) {
	const emailFormats = await ctx.db
		.query('emailFormats')
		.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	for (const emailFormat of emailFormats) {
		await ctx.db.delete(emailFormat._id);
	}
}

async function deleteTeamMemberRecords(ctx: MutationCtx, workspaceId: Id<'workspaces'>) {
	const teamMembers = await ctx.db
		.query('teamMembers')
		.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspaceId))
		.collect();

	for (const teamMember of teamMembers) {
		await ctx.db.delete(teamMember._id);
	}
}

async function deleteWorkspaceRecords(ctx: MutationCtx, workspace: Doc<'workspaces'>) {
	await deleteEmailFormatRecipientRecords(ctx, workspace._id);
	await deleteEmailFormatRecords(ctx, workspace._id);
	await deleteTeamMemberRecords(ctx, workspace._id);
	await deleteUploadedAvatar(ctx, workspace.avatar);
	await ctx.db.delete(workspace._id);
}

async function getAdminWorkspaces(ctx: MutationCtx, admin: Doc<'admins'>) {
	return await ctx.db
		.query('workspaces')
		.withIndex('by_adminId', (q) => q.eq('adminId', admin._id))
		.collect();
}

async function deleteAccountRecords(ctx: MutationCtx, admin: Doc<'admins'>) {
	const workspaces = await getAdminWorkspaces(ctx, admin);

	for (const workspace of workspaces) {
		await deleteWorkspaceRecords(ctx, workspace);
	}

	await deleteUploadedAvatar(ctx, admin.avatar);
	await ctx.db.delete(admin._id);
}

async function recordDeletedClerkUser(ctx: MutationCtx, clerkUserId: string) {
	const existingDeletion = await ctx.db
		.query('deletedClerkUsers')
		.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', clerkUserId))
		.first();

	if (existingDeletion) {
		return;
	}

	await ctx.db.insert('deletedClerkUsers', {
		clerkUserId,
		deletedAt: Date.now()
	});
}

export async function deleteAccountForClerkUserId(ctx: MutationCtx, clerkUserId: string) {
	await recordDeletedClerkUser(ctx, clerkUserId);

	const admin = await ctx.db
		.query('admins')
		.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', clerkUserId))
		.first();

	if (!admin) {
		return { ok: true };
	}

	await deleteAccountRecords(ctx, admin);

	return { ok: true };
}
