import { api } from '$convex/_generated/api';
import type { Doc, Id } from '$convex/_generated/dataModel';
import type { EmailDraft } from '$lib/builder-domain/email';
import { useConvexClient, useQuery } from 'convex-svelte';

export type CustomEmailRunHandle = {
	runId: Id<'customEmailRuns'>;
	resumeToken: string;
	builderSlug: string;
	expiresAt: number;
};

export type CustomEmailRunMessage = {
	_id: string;
	role: 'user' | 'assistant';
	text: string;
	status: 'pending' | 'streaming' | 'complete' | 'failed';
	operationId?: string;
	errorText?: string;
};

export type CustomEmailRunSnapshot = {
	handle: CustomEmailRunHandle | null;
	run: Doc<'customEmailRuns'> | null;
	messages: CustomEmailRunMessage[];
};

type ServerCustomEmailRunSnapshot = {
	handle: CustomEmailRunHandle;
	run: Doc<'customEmailRuns'>;
	messages: Doc<'customEmailMessages'>[];
};

type StoredCustomEmailRunHandle = Omit<CustomEmailRunHandle, 'runId'> & {
	runId: string;
};

function getStorageKey(builderSlug: string) {
	return `overbase:custom-email-run:${builderSlug}`;
}

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : 'Something went wrong.';
}

function parseStoredHandle(value: unknown): CustomEmailRunHandle | null {
	if (!value || typeof value !== 'object') {
		return null;
	}

	const candidate = value as Record<string, unknown>;

	if (
		typeof candidate.runId !== 'string' ||
		typeof candidate.resumeToken !== 'string' ||
		typeof candidate.builderSlug !== 'string' ||
		typeof candidate.expiresAt !== 'number' ||
		!candidate.runId ||
		!candidate.resumeToken ||
		!candidate.builderSlug ||
		candidate.expiresAt <= Date.now()
	) {
		return null;
	}

	return candidate as StoredCustomEmailRunHandle as CustomEmailRunHandle;
}

function readStoredHandle(builderSlug: string) {
	if (typeof sessionStorage === 'undefined') {
		return null;
	}

	try {
		return parseStoredHandle(JSON.parse(sessionStorage.getItem(getStorageKey(builderSlug)) ?? 'null'));
	} catch {
		return null;
	}
}

function writeStoredHandle(handle: CustomEmailRunHandle) {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.setItem(getStorageKey(handle.builderSlug), JSON.stringify(handle));
	}
}

function clearStoredHandle(builderSlug: string) {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.removeItem(getStorageKey(builderSlug));
	}
}

function toUiSnapshot(snapshot: ServerCustomEmailRunSnapshot): CustomEmailRunSnapshot {
	return {
		handle: snapshot.handle,
		run: snapshot.run,
		messages: snapshot.messages
	};
}

function createInitialSnapshot(initialMessage: string): CustomEmailRunSnapshot | null {
	const normalizedInitialMessage = initialMessage.trim();

	if (!normalizedInitialMessage) {
		return null;
	}

	return {
		handle: null,
		run: null,
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

function getSnapshotUpdatedAt(snapshot: CustomEmailRunSnapshot) {
	return snapshot.run?.updatedAt ?? 0;
}

function createLocalMessageId(prefix: string) {
	return `${prefix}-${crypto.randomUUID()}`;
}

function chooseSnapshot(
	localSnapshot: CustomEmailRunSnapshot | null,
	liveSnapshot: CustomEmailRunSnapshot | null
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

export function createCustomEmailRunController(
	builderSlug: string,
	readInitialMessage: () => string = () => ''
) {
	const client = useConvexClient();
	const initialSnapshot = createInitialSnapshot(readInitialMessage());
	let handle = $state<CustomEmailRunHandle | null>(null);
	let localSnapshot = $state<CustomEmailRunSnapshot | null>(initialSnapshot);
	let error = $state<string | null>(null);
	let operationVersion = 0;

	const liveSnapshotQuery = useQuery(api.customEmailBuilder.getRunSnapshot, () =>
		handle ? { runId: handle.runId, resumeToken: handle.resumeToken } : 'skip'
	);
	const liveSnapshot = $derived(liveSnapshotQuery.data ? toUiSnapshot(liveSnapshotQuery.data) : null);
	const snapshot = $derived(chooseSnapshot(localSnapshot, liveSnapshot));
	const messages = $derived(snapshot?.messages ?? []);
	const run = $derived(snapshot?.run ?? null);
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

	function setServerSnapshot(nextSnapshot: ServerCustomEmailRunSnapshot) {
		const uiSnapshot = toUiSnapshot(nextSnapshot);
		handle = nextSnapshot.handle;
		localSnapshot = uiSnapshot;
		writeStoredHandle(nextSnapshot.handle);
	}

	function clearLocal() {
		handle = null;
		localSnapshot = null;
		error = null;
		clearStoredHandle(builderSlug);
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
			const result = await client.mutation(api.customEmailBuilder.startRun, {
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
		const storedHandle = readStoredHandle(builderSlug);

		if (!storedHandle || storedHandle.builderSlug !== builderSlug) {
			clearLocal();
			return null;
		}

		const operation = (operationVersion += 1);
		error = null;

		try {
			const result = await client.mutation(api.customEmailBuilder.resumeRun, {
				runId: storedHandle.runId,
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
			throw new Error('Builder run not found.');
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
				run: currentSnapshot.run
					? {
							...currentSnapshot.run,
							phase:
								currentSnapshot.run.phase === 'waitingForInitialAnswer'
									? 'applyingInitialAnswer'
									: 'refining',
							activeMessageOperationId: localOperationId,
							updatedAt: now
						}
					: currentSnapshot.run,
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
			const result = await client.mutation(api.customEmailBuilder.sendMessage, {
				runId: handle.runId,
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
			throw new Error('Builder run not found.');
		}

		const result = await client.mutation(api.customEmailBuilder.saveVisibleEmailDraft, {
			runId: handle.runId,
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
		get run() {
			return run;
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
				Boolean(run) &&
				!run?.errorText &&
				(run?.phase === 'waitingForInitialAnswer' || run?.phase === 'ready');
		},
		resumeStored,
		saveVisibleEmailDraft,
		start,
		send
	};
}
