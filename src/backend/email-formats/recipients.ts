import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';
import { getTeammateDisplayName } from '../../convex/teammateIdentity';
import type { ViewerIdentity } from '../../shared/viewer';
import { requireViewerWorkspace, type ViewerWorkspace } from '../auth/viewer';

export type EmailFormatRecipientRef =
	| {
			kind: 'user';
			userId: Id<'users'>;
	  }
	| {
			kind: 'teammate';
			teammateId: Id<'teammates'>;
	  };

export function getViewerUserDisplayName(
	user: Pick<Doc<'users'>, 'displayName'>,
	viewerIdentity: ViewerIdentity
) {
	return user.displayName?.trim() || viewerIdentity.email;
}

export function getUserDisplayName(user: Pick<Doc<'users'>, 'displayName'>) {
	return user.displayName?.trim() || 'Unknown user';
}

export function getFormatRecipientKey(ref: EmailFormatRecipientRef) {
	return ref.kind === 'user' ? `user:${ref.userId}` : `teammate:${ref.teammateId}`;
}

export function getDefaultEmailFormatRecipientRefs(userId: Id<'users'>): EmailFormatRecipientRef[] {
	return [{ kind: 'user', userId }];
}

async function isWorkspaceUserRef(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	userId: Id<'users'>
) {
	const user = await ctx.db.get(userId);

	return Boolean(user && user.workspaceId === workspaceId);
}

async function isWorkspaceTeammateRef(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	teammateId: Id<'teammates'>
) {
	const teammate = await ctx.db.get(teammateId);

	return Boolean(teammate && teammate.workspaceId === workspaceId);
}

async function isValidRecipientRef(
	ctx: QueryCtx | MutationCtx,
	workspaceId: Id<'workspaces'>,
	ref: EmailFormatRecipientRef
) {
	if (ref.kind === 'user') {
		return await isWorkspaceUserRef(ctx, workspaceId, ref.userId);
	}

	return await isWorkspaceTeammateRef(ctx, workspaceId, ref.teammateId);
}

export async function getFormatRecipients(
	ctx: QueryCtx | MutationCtx,
	viewerWorkspace?: ViewerWorkspace
) {
	const viewer = viewerWorkspace ?? (await requireViewerWorkspace(ctx));
	const { user, workspace, identity } = viewer;
	const dbTeammates = await ctx.db
		.query('teammates')
		.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspace._id))
		.order('desc')
		.collect();

	return [
		{
			id: getFormatRecipientKey({ kind: 'user', userId: user._id }),
			ref: { kind: 'user' as const, userId: user._id },
			name: getViewerUserDisplayName(user, identity),
			avatarUrl: user.avatar?.url ?? ''
		},
		...dbTeammates.map((teammate) => {
			const ref = { kind: 'teammate' as const, teammateId: teammate._id };

			return {
				id: getFormatRecipientKey(ref),
				ref,
				name: getTeammateDisplayName(teammate),
				avatarUrl: ''
			};
		})
	];
}

export async function normalizeEmailFormatRecipientRefs(
	ctx: QueryCtx | MutationCtx,
	recipientRefs: EmailFormatRecipientRef[],
	viewerWorkspace?: ViewerWorkspace
) {
	const { user, workspace } = viewerWorkspace ?? (await requireViewerWorkspace(ctx));
	const normalizedRefs: EmailFormatRecipientRef[] = [];
	const seenKeys = new Set<string>();

	for (const ref of recipientRefs) {
		const key = getFormatRecipientKey(ref);

		if (seenKeys.has(key) || !(await isValidRecipientRef(ctx, workspace._id, ref))) {
			continue;
		}

		seenKeys.add(key);
		normalizedRefs.push(ref);
	}

	return normalizedRefs.length > 0 ? normalizedRefs : getDefaultEmailFormatRecipientRefs(user._id);
}
