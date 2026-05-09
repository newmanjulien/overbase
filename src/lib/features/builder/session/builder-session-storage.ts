import type { Id } from '$convex/_generated/dataModel';

export type BuilderSessionHandle = {
	sessionId: Id<'builderSessions'>;
	resumeToken: string;
	appSlug: string;
	expiresAt: number;
};

type StoredBuilderSessionHandle = Omit<BuilderSessionHandle, 'sessionId'> & {
	sessionId: string;
};

const BUILDER_SESSION_STORAGE_VERSION = 2;

function getStorageKey(appSlug: string) {
	return `overbase:builder-session:v${BUILDER_SESSION_STORAGE_VERSION}:${appSlug}`;
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
		typeof candidate.resumeToken !== 'string' ||
		typeof candidate.appSlug !== 'string' ||
		typeof candidate.expiresAt !== 'number' ||
		!candidate.sessionId ||
		!candidate.resumeToken ||
		!candidate.appSlug ||
		candidate.expiresAt <= Date.now()
	) {
		return null;
	}

	return candidate as StoredBuilderSessionHandle as BuilderSessionHandle;
}

export function readStoredBuilderSessionHandle(appSlug: string) {
	if (typeof sessionStorage === 'undefined') {
		return null;
	}

	try {
		return parseStoredHandle(JSON.parse(sessionStorage.getItem(getStorageKey(appSlug)) ?? 'null'));
	} catch {
		return null;
	}
}

export function writeStoredBuilderSessionHandle(handle: BuilderSessionHandle) {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.setItem(getStorageKey(handle.appSlug), JSON.stringify(handle));
	}
}

export function clearStoredBuilderSessionHandle(appSlug: string) {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.removeItem(getStorageKey(appSlug));
		sessionStorage.removeItem(getLegacyStorageKey(appSlug));
	}
}
