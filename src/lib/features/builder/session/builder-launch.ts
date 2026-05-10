import {
	createBuilderSessionStartRequest,
	type BuilderSessionStartRequest
} from './builder-session-start';
import {
	normalizeBuilderRunSetup,
	type BuilderGuideSetup,
	type BuilderRunSetup
} from '@overbase/builder-sdk/app-protocol';
export { clearStoredBuilderSessionHandle } from './builder-session-storage';

export type BuilderLaunchState = {
	appSlug: string;
	fresh: boolean;
	setup?: BuilderRunSetup;
	startRequestId?: string;
	resumeToken?: string;
};

type BuilderLaunchOptions = {
	fresh?: boolean;
	setup?: BuilderRunSetup | null;
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

function parseBuilderLaunchState(value: unknown, appSlug: string): BuilderLaunchState | null {
	if (!value || typeof value !== 'object') {
		return null;
	}

	const candidate = value as Record<string, unknown>;
	const candidateAppSlug = normalizeString(candidate.appSlug);

	if (candidateAppSlug !== appSlug) {
		return null;
	}

	const setup = parseRunSetup(candidate.setup);
	const startRequestId = normalizeString(candidate.startRequestId);
	const resumeToken = normalizeString(candidate.resumeToken);

	return {
		appSlug,
		fresh: candidate.fresh === true,
		...(setup ? { setup } : {}),
		...(startRequestId ? { startRequestId } : {}),
		...(resumeToken ? { resumeToken } : {})
	};
}

export function createBuilderLaunchState(
	appSlug: string,
	options: BuilderLaunchOptions = {}
): BuilderLaunchState {
	const setup = options.setup ? normalizeBuilderRunSetup(options.setup) : null;
	const startRequest = setup?.initialMessage
		? createBuilderSessionStartRequest({
				startRequestId: options.startRequestId ?? undefined,
				resumeToken: options.resumeToken ?? undefined
			})
		: null;

	return {
		appSlug,
		fresh: options.fresh ?? true,
		...(setup ? { setup } : {}),
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
