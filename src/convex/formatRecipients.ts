import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { requireWorkspace } from './auth';
import { getTeamMemberDisplayName } from './teamMemberIdentity';

export type FormatRecipientRef =
	| {
			kind: 'user';
			userId: Id<'users'>;
	  }
	| {
			kind: 'teamMember';
			teamMemberId: Id<'teamMembers'>;
	  };

export function getUserDisplayName(user: Pick<Doc<'users'>, 'displayName' | 'email'>) {
	return user.displayName?.trim() || user.email;
}

export function getFormatRecipientKey(ref: FormatRecipientRef) {
	return ref.kind === 'user' ? `user:${ref.userId}` : `teamMember:${ref.teamMemberId}`;
}

export function getDefaultFormatRecipientRefs(userId: Id<'users'>): FormatRecipientRef[] {
	return [{ kind: 'user', userId }];
}

async function isWorkspaceUserRef(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
) {
	const membership = await ctx.db
		.query('workspaceMemberships')
		.withIndex('by_workspace_user', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
		.first();

	return Boolean(membership);
}

async function isWorkspaceTeamMemberRef(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	teamMemberId: Id<'teamMembers'>
) {
	const teamMember = await ctx.db.get(teamMemberId);

	return Boolean(teamMember && teamMember.workspaceId === workspaceId);
}

async function isValidRecipientRef(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	ref: FormatRecipientRef
) {
	if (ref.kind === 'user') {
		return await isWorkspaceUserRef(ctx, workspaceId, ref.userId);
	}

	return await isWorkspaceTeamMemberRef(ctx, workspaceId, ref.teamMemberId);
}

export async function getFormatRecipients(ctx: QueryCtx | MutationCtx) {
	const { user, workspace } = await requireWorkspace(ctx);
	const dbTeamMembers = await ctx.db
		.query('teamMembers')
		.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspace._id))
		.order('desc')
		.collect();

	return [
		{
			id: getFormatRecipientKey({ kind: 'user', userId: user._id }),
			ref: { kind: 'user' as const, userId: user._id },
			name: getUserDisplayName(user),
			avatar: user.avatarUrl ?? ''
		},
		...dbTeamMembers.map((teamMember) => {
			const ref = { kind: 'teamMember' as const, teamMemberId: teamMember._id };

			return {
				id: getFormatRecipientKey(ref),
				ref,
				name: getTeamMemberDisplayName(teamMember),
				avatar: ''
			};
		})
	];
}

export async function normalizeFormatRecipientRefs(
	ctx: QueryCtx | MutationCtx,
	recipientRefs: FormatRecipientRef[]
) {
	const { user, workspace } = await requireWorkspace(ctx);
	const normalizedRefs: FormatRecipientRef[] = [];
	const seenKeys = new Set<string>();

	for (const ref of recipientRefs) {
		const key = getFormatRecipientKey(ref);

		if (seenKeys.has(key) || !(await isValidRecipientRef(ctx, workspace._id, ref))) {
			continue;
		}

		seenKeys.add(key);
		normalizedRefs.push(ref);
	}

	return normalizedRefs.length > 0 ? normalizedRefs : getDefaultFormatRecipientRefs(user._id);
}
