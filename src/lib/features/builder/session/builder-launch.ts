import {
	createBuilderSessionStartRequest,
	type BuilderSessionStartRequest
} from './builder-session-start';
export { clearStoredBuilderSessionHandle } from './builder-session-storage';

export type BuilderLaunchState = {
	appSlug: string;
	fresh: boolean;
	initialMessage?: string;
	startRequestId?: string;
	resumeToken?: string;
};

type BuilderLaunchOptions = {
	fresh?: boolean;
	initialMessage?: string | null;
	startRequestId?: string | null;
	resumeToken?: string | null;
};

const PENDING_BUILDER_LAUNCH_STORAGE_VERSION = 1;

function getPendingLaunchStorageKey(appSlug: string) {
	return `overbase:builder-launch:v${PENDING_BUILDER_LAUNCH_STORAGE_VERSION}:${appSlug}`;
}

function normalizeString(value: unknown) {
	return typeof value === 'string' ? value.trim() : '';
}

function parseBuilderLaunchState(value: unknown, appSlug: string): BuilderLaunchState | null {
	if (!value || typeof value !== 'object') {
		return null;
	}

	const candidate = value as Record<string, unknown>;
	const candidateAppSlug = normalizeString(candidate.appSlug);

	if (candidateAppSlug !== appSlug) {
		return null;
	}

	const initialMessage = normalizeString(candidate.initialMessage);
	const startRequestId = normalizeString(candidate.startRequestId);
	const resumeToken = normalizeString(candidate.resumeToken);

	return {
		appSlug,
		fresh: candidate.fresh === true,
		...(initialMessage ? { initialMessage } : {}),
		...(startRequestId ? { startRequestId } : {}),
		...(resumeToken ? { resumeToken } : {})
	};
}

export function createBuilderLaunchState(
	appSlug: string,
	options: BuilderLaunchOptions = {}
): BuilderLaunchState {
	const initialMessage = options.initialMessage?.trim() ?? '';
	const startRequest = initialMessage
		? createBuilderSessionStartRequest({
				startRequestId: options.startRequestId ?? undefined,
				resumeToken: options.resumeToken ?? undefined
			})
		: null;

	return {
		appSlug,
		fresh: options.fresh ?? true,
		...(initialMessage ? { initialMessage } : {}),
		...(startRequest ? toLaunchStartRequest(startRequest) : {})
	};
}

function toLaunchStartRequest(startRequest: BuilderSessionStartRequest) {
	return {
		startRequestId: startRequest.startRequestId,
		resumeToken: startRequest.resumeToken
	};
}

export function readPendingBuilderLaunch(appSlug: string): BuilderLaunchState | null {
	if (typeof sessionStorage === 'undefined') {
		return null;
	}

	try {
		return parseBuilderLaunchState(
			JSON.parse(sessionStorage.getItem(getPendingLaunchStorageKey(appSlug)) ?? 'null'),
			appSlug
		);
	} catch {
		return null;
	}
}

export function writePendingBuilderLaunch(launch: BuilderLaunchState) {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.setItem(getPendingLaunchStorageKey(launch.appSlug), JSON.stringify(launch));
	}
}

export function clearPendingBuilderLaunch(appSlug: string) {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.removeItem(getPendingLaunchStorageKey(appSlug));
	}
}

export function readBuilderLaunchFromPageState(
	appSlug: string,
	pageState: {
		builderLaunch?: unknown;
	}
): BuilderLaunchState | null {
	return parseBuilderLaunchState(pageState.builderLaunch, appSlug);
}
