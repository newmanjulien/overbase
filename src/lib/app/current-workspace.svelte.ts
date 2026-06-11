import type { Doc } from '$convex/_generated/dataModel';
import type { ViewerIdentity } from '$domain/viewer';
import { getContext, setContext } from 'svelte';

const CURRENT_WORKSPACE_CONTEXT_KEY = Symbol('current-workspace-context');

export type { ViewerIdentity } from '$domain/viewer';

export type CurrentWorkspaceContext = {
	admin: Doc<'admins'>;
	workspace: Doc<'workspaces'>;
	identity: ViewerIdentity;
};

export type CurrentWorkspaceStorageScope = {
	adminId: Doc<'admins'>['_id'];
	workspaceId: Doc<'workspaces'>['_id'];
};

export function provideCurrentWorkspaceContext(context: CurrentWorkspaceContext) {
	return setContext(CURRENT_WORKSPACE_CONTEXT_KEY, context);
}

export function useCurrentWorkspaceContext() {
	const context = getContext<CurrentWorkspaceContext | undefined>(CURRENT_WORKSPACE_CONTEXT_KEY);

	if (!context) {
		throw new Error('Current workspace context was used outside the authenticated app shell.');
	}

	return context;
}

export function getCurrentWorkspaceStorageScope({
	admin,
	workspace
}: CurrentWorkspaceContext): CurrentWorkspaceStorageScope {
	return {
		adminId: admin._id,
		workspaceId: workspace._id
	};
}
