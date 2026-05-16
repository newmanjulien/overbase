import type { Id } from '$convex/_generated/dataModel';
import type { CurrentWorkspaceStorageScope } from '$lib/app/current-workspace.svelte';

export type BuilderSessionHandle = {
	sessionId: Id<'builderSessions'>;
	appSlug: string;
	expiresAt: number;
};

type StoredBuilderSessionHandle = Omit<BuilderSessionHandle, 'sessionId'> & {
	sessionId: string;
};

const BUILDER_SESSION_STORAGE_VERSION = 3;

function getStorageOwnerKey(scope: CurrentWorkspaceStorageScope) {
	return `${scope.workspaceId}:${scope.userId}`;
}

function getStorageKey(appSlug: string, scope: CurrentWorkspaceStorageScope) {
	return `overbase:builder-session:v${BUILDER_SESSION_STORAGE_VERSION}:${getStorageOwnerKey(scope)}:${appSlug}`;
}

function getLegacyStorageKey(appSlug: string) {
	return `overbase:builder-session:${appSlug}`;
}

function parseStoredHandle(value: unknown): BuilderSessionHandle | null {
	if (!value || typeof value !== 'object') {
		return null;
	}

	const candidate = value as Record<string, unknown>;

	if (
		typeof candidate.sessionId !== 'string' ||
		typeof candidate.appSlug !== 'string' ||
		typeof candidate.expiresAt !== 'number' ||
		!candidate.sessionId ||
		!candidate.appSlug ||
		candidate.expiresAt <= Date.now()
	) {
		return null;
	}

	return candidate as StoredBuilderSessionHandle as BuilderSessionHandle;
}

export function readStoredBuilderSessionHandle(
	appSlug: string,
	scope: CurrentWorkspaceStorageScope
) {
	if (typeof sessionStorage === 'undefined') {
		return null;
	}

	try {
		return parseStoredHandle(JSON.parse(sessionStorage.getItem(getStorageKey(appSlug, scope)) ?? 'null'));
	} catch {
		return null;
	}
}

export function writeStoredBuilderSessionHandle(
	handle: BuilderSessionHandle,
	scope: CurrentWorkspaceStorageScope
) {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.setItem(getStorageKey(handle.appSlug, scope), JSON.stringify(handle));
	}
}

export function clearStoredBuilderSessionHandle(
	appSlug: string,
	scope: CurrentWorkspaceStorageScope
) {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.removeItem(getStorageKey(appSlug, scope));
		sessionStorage.removeItem('overbase:builder-session:v3:' + appSlug);
		sessionStorage.removeItem('overbase:builder-session:v2:' + appSlug);
		sessionStorage.removeItem(getLegacyStorageKey(appSlug));
	}
}
