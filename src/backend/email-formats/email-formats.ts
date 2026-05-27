import type { Id } from '../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';
import type { ViewerWorkspace } from '../auth/viewer';
import { getUserDisplayName, getViewerUserDisplayName } from './recipients';

const DEFAULT_EMAIL_FORMAT_TITLE = 'Untitled email format';

export function normalizeEmailFormatTitle(title: string) {
	return title.trim() || DEFAULT_EMAIL_FORMAT_TITLE;
}

export async function getEmailFormatCreator(
	ctx: QueryCtx | MutationCtx,
	userId: Id<'users'>,
	viewerWorkspace?: ViewerWorkspace
) {
	const user = await ctx.db.get(userId);
	const viewerIdentity =
		viewerWorkspace && userId === viewerWorkspace.user._id
			? viewerWorkspace.identity
			: undefined;

	return {
		id: userId,
		name: user
			? viewerIdentity
				? getViewerUserDisplayName(user, viewerIdentity)
				: getUserDisplayName(user)
			: 'Unknown user',
		avatarUrl: user?.avatar?.url ?? ''
	};
}
