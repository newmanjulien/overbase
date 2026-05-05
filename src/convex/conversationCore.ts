export const MAX_MESSAGE_LENGTH = 8_000;
export const CONVERSATION_RETENTION_MS = 24 * 60 * 60 * 1000;

export function createGenerationId() {
	return crypto.randomUUID();
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

export function getConversationExpiresAt(createdAt: number) {
	return createdAt + CONVERSATION_RETENTION_MS;
}

export function isConversationExpired(conversation: { expiresAt: number }, now = Date.now()) {
	return conversation.expiresAt <= now;
}
