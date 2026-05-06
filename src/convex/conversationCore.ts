export const MAX_MESSAGE_LENGTH = 8_000;
export const CONVERSATION_IDLE_RETENTION_MS = 2 * 60 * 60 * 1000;

type ExpiringRecord = {
	expiresAt: number;
};

type ResumableConversation = ExpiringRecord & {
	resumeTokenHash: string;
};

export function createGenerationId() {
	return crypto.randomUUID();
}

export function createResumeToken() {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);

	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashResumeToken(resumeToken: string) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(resumeToken));

	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function verifyResumeToken(
	conversation: ResumableConversation,
	resumeToken: string
) {
	return resumeToken.length > 0 && (await hashResumeToken(resumeToken)) === conversation.resumeTokenHash;
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
	return createdAt + CONVERSATION_IDLE_RETENTION_MS;
}

export function isConversationExpired(conversation: ExpiringRecord, now = Date.now()) {
	return conversation.expiresAt <= now;
}

export function isConversationActive(conversation: ExpiringRecord, now = Date.now()) {
	return !isConversationExpired(conversation, now);
}
