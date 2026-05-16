export const MAX_MESSAGE_LENGTH = 8_000;
export const START_REQUEST_ID_MAX_LENGTH = 128;
export const BUILDER_SESSION_IDLE_RETENTION_MS = 2 * 60 * 60 * 1000;

type ExpiringRecord = {
	expiresAt: number;
};

export function normalizeStartRequestId(startRequestId?: string) {
	const normalized = startRequestId?.trim();

	if (!normalized) {
		return undefined;
	}

	if (normalized.length > START_REQUEST_ID_MAX_LENGTH) {
		throw new Error(`Start request id must be ${START_REQUEST_ID_MAX_LENGTH} characters or fewer.`);
	}

	return normalized;
}

export function normalizeUserText(text: string) {
	const normalized = text.trim();

	if (!normalized) {
		throw new Error('Message text is required.');
	}

	if (normalized.length > MAX_MESSAGE_LENGTH) {
		throw new Error(`Message text must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
	}

	return normalized;
}

export function getBuilderSessionExpiresAt(createdAt: number) {
	return createdAt + BUILDER_SESSION_IDLE_RETENTION_MS;
}

export function isBuilderSessionExpired(session: ExpiringRecord, now = Date.now()) {
	return session.expiresAt <= now;
}

export function isBuilderSessionActive(session: ExpiringRecord, now = Date.now()) {
	return !isBuilderSessionExpired(session, now);
}
