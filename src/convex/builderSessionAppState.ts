import type { BuilderAppState } from '@overbase/builder-sdk/app-protocol';
import {
	BUILDER_HOST_APP_STATE_VERSION,
	patchBuilderHostAppState
} from '@overbase/builder-sdk/host';

type AppStateRecord = Record<string, unknown>;

type AppStateHolder = {
	appState?: unknown;
};

function isAppStateRecord(value: unknown): value is AppStateRecord {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isVersionedAppState(value: unknown): value is { version: number; value: unknown } {
	return (
		isAppStateRecord(value) &&
		typeof value.version === 'number' &&
		Object.hasOwn(value, 'value')
	);
}

export function getBuilderSessionAppState(session: AppStateHolder): AppStateRecord {
	const appState = getVersionedBuilderSessionAppState(session);

	return isAppStateRecord(appState.value) ? appState.value : {};
}

export function getVersionedBuilderSessionAppState(session: AppStateHolder): BuilderAppState {
	if (isVersionedAppState(session.appState)) {
		return {
			version: session.appState.version,
			value: isAppStateRecord(session.appState.value) ? session.appState.value : {}
		};
	}

	return {
		version: BUILDER_HOST_APP_STATE_VERSION,
		value: isAppStateRecord(session.appState) ? session.appState : {}
	};
}

export function mergeBuilderSessionAppState(
	session: AppStateHolder,
	patch: AppStateRecord
): BuilderAppState {
	return patchBuilderHostAppState(getVersionedBuilderSessionAppState(session), patch);
}
