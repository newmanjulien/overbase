import { api } from '$convex/_generated/api';
import type { Doc, Id } from '$convex/_generated/dataModel';
import type { EmailDraft } from '$lib/features/builder/domain/email-design';
import { useConvexClient, useQuery } from 'convex-svelte';

export type BuilderSessionHandle = {
	sessionId: Id<'builderSessions'>;
	resumeToken: string;
	productSlug: string;
	expiresAt: number;
};

export type BuilderSessionMessage = {
	_id: string;
	role: 'user' | 'assistant';
	text: string;
	status: 'pending' | 'streaming' | 'complete' | 'failed';
	operationId?: string;
	errorText?: string;
};

export type BuilderSessionSnapshot = {
	handle: BuilderSessionHandle | null;
	session: Doc<'builderSessions'> | null;
	messages: BuilderSessionMessage[];
};

type ServerBuilderSessionSnapshot = {
	handle: BuilderSessionHandle;
	session: Doc<'builderSessions'>;
	messages: Doc<'builderSessionMessages'>[];
};

type StoredBuilderSessionHandle = Omit<BuilderSessionHandle, 'sessionId'> & {
	sessionId: string;
};

function getStorageKey(productSlug: string) {
	return `overbase:builder-session:${productSlug}`;
}

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : 'Something went wrong.';
}

function parseStoredHandle(value: unknown): BuilderSessionHandle | null {
	if (!value || typeof value !== 'object') {
		return null;
	}

	const candidate = value as Record<string, unknown>;

	if (
		typeof candidate.sessionId !== 'string' ||
		typeof candidate.resumeToken !== 'string' ||
		typeof candidate.productSlug !== 'string' ||
		typeof candidate.expiresAt !== 'number' ||
		!candidate.sessionId ||
		!candidate.resumeToken ||
		!candidate.productSlug ||
		candidate.expiresAt <= Date.now()
	) {
		return null;
	}

	return candidate as StoredBuilderSessionHandle as BuilderSessionHandle;
}

function readStoredHandle(productSlug: string) {
	if (typeof sessionStorage === 'undefined') {
		return null;
	}

	try {
		return parseStoredHandle(JSON.parse(sessionStorage.getItem(getStorageKey(productSlug)) ?? 'null'));
	} catch {
		return null;
	}
}

function writeStoredHandle(handle: BuilderSessionHandle) {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.setItem(getStorageKey(handle.productSlug), JSON.stringify(handle));
	}
}

function clearStoredHandle(productSlug: string) {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.removeItem(getStorageKey(productSlug));
	}
}

function toUiSnapshot(snapshot: ServerBuilderSessionSnapshot): BuilderSessionSnapshot {
	return {
		handle: snapshot.handle,
		session: snapshot.session,
		messages: snapshot.messages
	};
}

function createInitialSnapshot(initialMessage: string): BuilderSessionSnapshot | null {
	const normalizedInitialMessage = initialMessage.trim();

	if (!normalizedInitialMessage) {
		return null;
	}

	return {
		handle: null,
		session: null,
		messages: [
			{
				_id: 'local-initial-user',
				role: 'user',
				text: normalizedInitialMessage,
				status: 'complete'
			},
			{
				_id: 'local-initial-assistant',
				role: 'assistant',
				text: '',
				status: 'pending'
			}
		]
	};
}

function getSnapshotUpdatedAt(snapshot: BuilderSessionSnapshot) {
	return snapshot.session?.updatedAt ?? 0;
}

function createLocalMessageId(prefix: string) {
	return `${prefix}-${crypto.randomUUID()}`;
}

function chooseSnapshot(
	localSnapshot: BuilderSessionSnapshot | null,
	liveSnapshot: BuilderSessionSnapshot | null
) {
	if (!localSnapshot) {
		return liveSnapshot;
	}

	if (!liveSnapshot) {
		return localSnapshot;
	}

	if (liveSnapshot.messages.length < localSnapshot.messages.length) {
		return localSnapshot;
	}

	if (getSnapshotUpdatedAt(liveSnapshot) < getSnapshotUpdatedAt(localSnapshot)) {
		return localSnapshot;
	}

	return liveSnapshot;
}

export function createBuilderSessionController(
	productSlug: string,
	readInitialMessage: () => string = () => ''
) {
	const client = useConvexClient();
	const initialSnapshot = createInitialSnapshot(readInitialMessage());
	let handle = $state<BuilderSessionHandle | null>(null);
	let localSnapshot = $state<BuilderSessionSnapshot | null>(initialSnapshot);
	let error = $state<string | null>(null);
	let operationVersion = 0;

	const liveSnapshotQuery = useQuery(api.builderSessions.getSessionSnapshot, () =>
		handle ? { sessionId: handle.sessionId, resumeToken: handle.resumeToken } : 'skip'
	);
	const liveSnapshot = $derived(liveSnapshotQuery.data ? toUiSnapshot(liveSnapshotQuery.data) : null);
	const snapshot = $derived(chooseSnapshot(localSnapshot, liveSnapshot));
	const messages = $derived(snapshot?.messages ?? []);
	const session = $derived(snapshot?.session ?? null);
	const hasActiveAssistant = $derived(
		messages.some(
			(message) =>
				message.role === 'assistant' &&
				(message.status === 'pending' || message.status === 'streaming')
		)
	);

	function isCurrentOperation(version: number) {
		return version === operationVersion;
	}

	function setServerSnapshot(nextSnapshot: ServerBuilderSessionSnapshot) {
		const uiSnapshot = toUiSnapshot(nextSnapshot);
		handle = nextSnapshot.handle;
		localSnapshot = uiSnapshot;
		writeStoredHandle(nextSnapshot.handle);
	}

	function clearLocal() {
		handle = null;
		localSnapshot = null;
		error = null;
		clearStoredHandle(productSlug);
	}

	async function start(message?: string) {
		const normalizedInitialMessage = (message ?? readInitialMessage()).trim();

		if (!normalizedInitialMessage) {
			throw new Error('Message text is required.');
		}

		const operation = (operationVersion += 1);
		error = null;
		handle = null;
		localSnapshot = localSnapshot ?? createInitialSnapshot(normalizedInitialMessage);

		try {
			const result = await client.mutation(api.builderSessions.startSession, {
				initialMessage: normalizedInitialMessage
			});

			if (isCurrentOperation(operation)) {
				setServerSnapshot(result);
			}

			return result.handle;
		} catch (startError) {
			if (isCurrentOperation(operation)) {
				error = getErrorMessage(startError);
			}

			throw startError;
		}
	}

	async function resumeStored() {
		const storedHandle = readStoredHandle(productSlug);

		if (!storedHandle || storedHandle.productSlug !== productSlug) {
			clearLocal();
			return null;
		}

		const operation = (operationVersion += 1);
		error = null;

		try {
			const result = await client.mutation(api.builderSessions.resumeSession, {
				sessionId: storedHandle.sessionId,
				resumeToken: storedHandle.resumeToken
			});

			if (!result) {
				if (isCurrentOperation(operation)) {
					clearLocal();
				}

				return null;
			}

			if (isCurrentOperation(operation)) {
				setServerSnapshot(result);
			}

			return result.handle;
		} catch (resumeError) {
			if (isCurrentOperation(operation)) {
				error = getErrorMessage(resumeError);
			}

			throw resumeError;
		}
	}

	async function send(text: string) {
		const normalizedText = text.trim();

		if (!handle) {
			throw new Error('Builder session not found.');
		}

		if (!normalizedText) {
			return handle;
		}

		const operation = (operationVersion += 1);
		const previousLocalSnapshot = localSnapshot;
		const currentSnapshot = snapshot;
		const localOperationId = createLocalMessageId('local-operation');
		const now = Date.now();

		error = null;

		if (currentSnapshot) {
			localSnapshot = {
				...currentSnapshot,
				session: currentSnapshot.session
					? {
							...currentSnapshot.session,
							phase:
								currentSnapshot.session.phase === 'waitingForInitialAnswer'
									? 'applyingInitialAnswer'
									: 'refining',
							activeMessageOperationId: localOperationId,
							updatedAt: now
						}
					: currentSnapshot.session,
				messages: [
					...currentSnapshot.messages,
					{
						_id: createLocalMessageId('local-user'),
						role: 'user',
						text: normalizedText,
						status: 'complete'
					},
					{
						_id: createLocalMessageId('local-assistant'),
						role: 'assistant',
						text: '',
						status: 'pending',
						operationId: localOperationId
					}
				]
			};
		}

		try {
			const result = await client.mutation(api.builderSessions.sendMessage, {
				sessionId: handle.sessionId,
				resumeToken: handle.resumeToken,
				text: normalizedText
			});

			if (isCurrentOperation(operation)) {
				setServerSnapshot(result);
			}

			return result.handle;
		} catch (sendError) {
			if (isCurrentOperation(operation)) {
				localSnapshot = previousLocalSnapshot;
			}

			throw sendError;
		}
	}

	async function saveVisibleEmailDraft(emailDraft: EmailDraft, baseArtifactVersion: number) {
		if (!handle) {
			throw new Error('Builder session not found.');
		}

		const result = await client.mutation(api.builderSessions.saveVisibleEmailDraft, {
			sessionId: handle.sessionId,
			resumeToken: handle.resumeToken,
			baseArtifactVersion,
			emailDraft
		});

		if (result.snapshot) {
			setServerSnapshot(result.snapshot);
		}

		return result;
	}

	return {
		get handle() {
			return snapshot?.handle ?? handle;
		},
		get session() {
			return session;
		},
		get messages() {
			return messages;
		},
		get error() {
			return error;
		},
		get queryError() {
			return liveSnapshotQuery.error ?? null;
		},
		get canSend() {
			return Boolean(handle) &&
				!hasActiveAssistant &&
				!liveSnapshotQuery.error &&
				Boolean(session) &&
				!session?.errorText &&
				(session?.phase === 'waitingForInitialAnswer' || session?.phase === 'ready');
		},
		resumeStored,
		saveVisibleEmailDraft,
		start,
		send
	};
}
