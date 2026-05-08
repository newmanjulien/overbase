type AppStateRecord = Record<string, unknown>;

type AppStateHolder = {
	appState?: unknown;
};

export const BUILDER_SESSION_APP_STATE_VERSION = 1;

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
	if (isVersionedAppState(session.appState)) {
		return isAppStateRecord(session.appState.value) ? session.appState.value : {};
	}

	return isAppStateRecord(session.appState) ? session.appState : {};
}

export function mergeBuilderSessionAppState(
	session: AppStateHolder,
	patch: AppStateRecord
): { version: number; value: AppStateRecord } {
	return {
		version: BUILDER_SESSION_APP_STATE_VERSION,
		value: {
			...getBuilderSessionAppState(session),
			...patch
		}
	};
}
