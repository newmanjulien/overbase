import type { Id } from '../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';
import type { ViewerWorkspace } from '../auth/viewer';
import { getUserDisplayName, getViewerUserDisplayName } from './recipients';

const DEFAULT_OPPORTUNITY_FORMAT_TITLE = 'Untitled format';

export function normalizeOpportunityFormatTitle(title: string) {
	return title.trim() || DEFAULT_OPPORTUNITY_FORMAT_TITLE;
}

export async function getOpportunityFormatCreator(
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
