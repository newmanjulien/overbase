import {
	createBuilderSessionStartRequest,
	type BuilderSessionStartRequest
} from './builder-session-start';
import {
	normalizeBuilderRunSetup,
	type BuilderGuideSetup,
	type BuilderRunSetup
} from '@overbase/builder-sdk/app-protocol';
import type { CurrentWorkspaceStorageScope } from '$lib/app/current-workspace.svelte';
export { clearStoredBuilderSessionHandle } from './builder-session-storage';

export type BuilderLaunchState = {
	appSlug: string;
	owner: CurrentWorkspaceStorageScope;
	fresh: boolean;
	setup?: BuilderRunSetup;
	startRequestId?: string;
};

type BuilderLaunchOptions = {
	fresh?: boolean;
	setup?: BuilderRunSetup | null;
	startRequestId?: string | null;
};

const PENDING_BUILDER_LAUNCH_STORAGE_VERSION = 1;

function getStorageOwnerKey(scope: CurrentWorkspaceStorageScope) {
	return `${scope.workspaceId}:${scope.userId}`;
}

function getPendingLaunchStorageKey(appSlug: string, scope: CurrentWorkspaceStorageScope) {
	return `overbase:builder-launch:v${PENDING_BUILDER_LAUNCH_STORAGE_VERSION}:${getStorageOwnerKey(scope)}:${appSlug}`;
}

function getLegacyPendingLaunchStorageKey(appSlug: string) {
	return `overbase:builder-launch:v${PENDING_BUILDER_LAUNCH_STORAGE_VERSION}:${appSlug}`;
}

function normalizeString(value: unknown) {
	return typeof value === 'string' ? value.trim() : '';
}

function isSameStorageScope(left: CurrentWorkspaceStorageScope, right: CurrentWorkspaceStorageScope) {
	return left.userId === right.userId && left.workspaceId === right.workspaceId;
}

function parseLaunchOwner(value: unknown): CurrentWorkspaceStorageScope | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return null;
	}

	const candidate = value as Record<string, unknown>;
	const userId = normalizeString(candidate.userId);
	const workspaceId = normalizeString(candidate.workspaceId);

	return userId && workspaceId
		? ({
				userId,
				workspaceId
			} as CurrentWorkspaceStorageScope)
		: null;
}

function parseGuideSetup(value: unknown): BuilderGuideSetup | undefined {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return undefined;
	}

	const candidate = value as Record<string, unknown>;

	if (candidate.action !== 'submitted' && candidate.action !== 'skippedRemaining') {
		return undefined;
	}

	if (!Array.isArray(candidate.answers)) {
		return undefined;
	}

	const answers = candidate.answers.flatMap((answer) => {
		if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
			return [];
		}

		const answerRecord = answer as Record<string, unknown>;
		const questionId = normalizeString(answerRecord.questionId);
		const questionTitle = normalizeString(answerRecord.questionTitle);
		const answerText = normalizeString(answerRecord.answer);

		return questionId && questionTitle && answerText
			? [{ questionId, questionTitle, answer: answerText }]
			: [];
	});

	return {
		action: candidate.action,
		answers
	};
}

function parseRunSetup(value: unknown): BuilderRunSetup | undefined {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return undefined;
	}

	const candidate = value as Record<string, unknown>;
	const initialMessage = normalizeString(candidate.initialMessage);

	if (candidate.kind === 'freeform' && initialMessage) {
		return normalizeBuilderRunSetup({
			kind: 'freeform',
			initialMessage
		});
	}

	if (candidate.kind === 'guided' && initialMessage) {
		const guideSetup = parseGuideSetup(candidate.guideSetup);

		if (!guideSetup) {
			return undefined;
		}

		return normalizeBuilderRunSetup({
			kind: 'guided',
			initialMessage,
			guideSetup
		});
	}

	return undefined;
}

function parseBuilderLaunchState(
	value: unknown,
	appSlug: string,
	scope: CurrentWorkspaceStorageScope
): BuilderLaunchState | null {
	if (!value || typeof value !== 'object') {
		return null;
	}

	const candidate = value as Record<string, unknown>;
	const candidateAppSlug = normalizeString(candidate.appSlug);

	if (candidateAppSlug !== appSlug) {
		return null;
	}

	const owner = parseLaunchOwner(candidate.owner);

	if (!owner || !isSameStorageScope(owner, scope)) {
		return null;
	}

	const setup = parseRunSetup(candidate.setup);
	const startRequestId = normalizeString(candidate.startRequestId);

	return {
		appSlug,
		owner,
		fresh: candidate.fresh === true,
		...(setup ? { setup } : {}),
		...(startRequestId ? { startRequestId } : {})
	};
}

export function createBuilderLaunchState(
	appSlug: string,
	scope: CurrentWorkspaceStorageScope,
	options: BuilderLaunchOptions = {}
): BuilderLaunchState {
	const setup = options.setup ? normalizeBuilderRunSetup(options.setup) : null;
	const startRequest = setup?.initialMessage
		? createBuilderSessionStartRequest({
				startRequestId: options.startRequestId ?? undefined
			})
		: null;

	return {
		appSlug,
		owner: scope,
		fresh: options.fresh ?? true,
		...(setup ? { setup } : {}),
		...(startRequest ? toLaunchStartRequest(startRequest) : {})
	};
}

function toLaunchStartRequest(startRequest: BuilderSessionStartRequest) {
	return {
		startRequestId: startRequest.startRequestId
	};
}

export function readPendingBuilderLaunch(
	appSlug: string,
	scope: CurrentWorkspaceStorageScope
): BuilderLaunchState | null {
	if (typeof sessionStorage === 'undefined') {
		return null;
	}

	try {
		return parseBuilderLaunchState(
			JSON.parse(sessionStorage.getItem(getPendingLaunchStorageKey(appSlug, scope)) ?? 'null'),
			appSlug,
			scope
		);
	} catch {
		return null;
	}
}

export function writePendingBuilderLaunch(
	launch: BuilderLaunchState,
	scope: CurrentWorkspaceStorageScope
) {
	if (typeof sessionStorage !== 'undefined') {
		if (!isSameStorageScope(launch.owner, scope)) {
			return;
		}

		sessionStorage.setItem(getPendingLaunchStorageKey(launch.appSlug, scope), JSON.stringify(launch));
	}
}

export function clearPendingBuilderLaunch(appSlug: string, scope: CurrentWorkspaceStorageScope) {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.removeItem(getPendingLaunchStorageKey(appSlug, scope));
		sessionStorage.removeItem(getLegacyPendingLaunchStorageKey(appSlug));
	}
}

export function readBuilderLaunchFromPageState(
	appSlug: string,
	pageState: {
		builderLaunch?: unknown;
	},
	scope: CurrentWorkspaceStorageScope
): BuilderLaunchState | null {
	return parseBuilderLaunchState(pageState.builderLaunch, appSlug, scope);
}
