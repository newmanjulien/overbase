import { api } from '$convex/_generated/api';
import type { Id } from '$convex/_generated/dataModel';
import type { BuilderCardRecord } from '$lib/features/builder-data';
import { useConvexClient } from 'convex-svelte';

export type BuilderConversationMode = 'chat';

export type BuilderConversationHandle = {
	conversationId: Id<'conversations'>;
	builderMode: BuilderConversationMode;
	resumeToken: string;
	cardSlug: string;
	expiresAt: number;
};

type StoredBuilderConversationHandle = Omit<
	BuilderConversationHandle,
	'conversationId'
> & {
	conversationId: string;
};

type ConversationStatus = 'idle' | 'starting' | 'resuming' | 'ready' | 'error';

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : 'Something went wrong.';
}

function isBuilderConversationMode(value: unknown): value is BuilderConversationMode {
	return value === 'chat';
}

function isStoredBuilderConversationHandle(
	value: unknown
): value is StoredBuilderConversationHandle {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const candidate = value as Record<string, unknown>;

	if (
		typeof candidate.conversationId !== 'string' ||
		!isBuilderConversationMode(candidate.builderMode) ||
		typeof candidate.resumeToken !== 'string' ||
		typeof candidate.cardSlug !== 'string' ||
		typeof candidate.expiresAt !== 'number' ||
		!Number.isFinite(candidate.expiresAt)
	) {
		return false;
	}

	if (!candidate.conversationId || !candidate.resumeToken || !candidate.cardSlug) {
		return false;
	}

	return true;
}

export function parseBuilderConversationHandle(value: unknown) {
	if (!isStoredBuilderConversationHandle(value)) {
		return null;
	}

	if (value.expiresAt <= Date.now()) {
		return null;
	}

	return {
		...value,
		conversationId: value.conversationId as Id<'conversations'>
	};
}

export function createBuilderConversationController() {
	const client = useConvexClient();
	let handle = $state<BuilderConversationHandle | null>(null);
	let status = $state<ConversationStatus>('idle');
	let error = $state<string | null>(null);
	let operationVersion = 0;

	function sameHandle(
		left: BuilderConversationHandle | null,
		right: BuilderConversationHandle | null
	) {
		return (
			Boolean(left) &&
			Boolean(right) &&
			left?.conversationId === right?.conversationId &&
			left?.resumeToken === right?.resumeToken
		);
	}

	function beginOperation(nextStatus: ConversationStatus) {
		operationVersion += 1;
		handle = null;
		status = nextStatus;
		error = null;

		return operationVersion;
	}

	function isCurrentOperation(version: number) {
		return version === operationVersion;
	}

	function setHandle(nextHandle: BuilderConversationHandle | null) {
		handle = nextHandle;
		status = nextHandle ? 'ready' : 'idle';
	}

	function clearLocal() {
		operationVersion += 1;
		handle = null;
		status = 'idle';
		error = null;
	}

	async function disposeHandle(handleToDispose: BuilderConversationHandle) {
		await client.mutation(api.chat.disposeConversation, {
			conversationId: handleToDispose.conversationId,
			resumeToken: handleToDispose.resumeToken
		});
	}

	async function dispose(targetHandle?: BuilderConversationHandle | null) {
		const handleToDispose = targetHandle === undefined ? handle : targetHandle;

		if (targetHandle === undefined || sameHandle(handle, handleToDispose)) {
			clearLocal();
		}

		if (!handleToDispose) {
			return;
		}

		try {
			await disposeHandle(handleToDispose);
		} catch {
			// Hard delete is best-effort on navigation. The short TTL is the fallback.
		}
	}

	async function start(initialMessage: string, card: BuilderCardRecord) {
		const normalizedInitialMessage = initialMessage.trim();

		if (!normalizedInitialMessage) {
			throw new Error('Message text is required.');
		}

		const previousHandle = handle;
		const operation = beginOperation('starting');

		if (previousHandle) {
			void disposeHandle(previousHandle).catch(() => {
				// Starting a new conversation should not be blocked by stale cleanup.
			});
		}

		try {
			const result = await client.mutation(api.chat.startConversation, {
				cardSlug: card.id,
				initialMessage: normalizedInitialMessage
			});

			const nextHandle: BuilderConversationHandle = {
				conversationId: result.conversationId,
				builderMode: result.builderMode,
				resumeToken: result.resumeToken,
				cardSlug: card.id,
				expiresAt: result.expiresAt
			};

			if (isCurrentOperation(operation)) {
				setHandle(nextHandle);
			}

			return nextHandle;
		} catch (startError) {
			if (isCurrentOperation(operation)) {
				handle = null;
				status = 'error';
				error = getErrorMessage(startError);
			}

			throw startError;
		}
	}

	async function resume(
		card: BuilderCardRecord,
		builderMode: BuilderConversationMode,
		resumeHandle: BuilderConversationHandle | null
	) {
		error = null;

		if (!resumeHandle) {
			clearLocal();
			return null;
		}

		if (resumeHandle.cardSlug !== card.id || resumeHandle.builderMode !== builderMode) {
			clearLocal();
			return null;
		}

		const operation = beginOperation('resuming');

		try {
			const result = await client.mutation(api.chat.resumeConversation, {
				conversationId: resumeHandle.conversationId,
				resumeToken: resumeHandle.resumeToken,
				cardSlug: card.id,
				builderMode
			});

			if (!result) {
				if (isCurrentOperation(operation)) {
					clearLocal();
				}

				return null;
			}

			const nextHandle: BuilderConversationHandle = {
				conversationId: result.conversationId,
				builderMode: result.builderMode,
				resumeToken: result.resumeToken,
				cardSlug: card.id,
				expiresAt: result.expiresAt
			};

			if (isCurrentOperation(operation)) {
				setHandle(nextHandle);
			}

			return nextHandle;
		} catch (resumeError) {
			if (isCurrentOperation(operation)) {
				handle = null;
				status = 'error';
				error = getErrorMessage(resumeError);
			}

			throw resumeError;
		}
	}

	async function send(text: string) {
		const currentHandle = handle;
		const normalizedText = text.trim();

		if (!currentHandle) {
			throw new Error('Conversation not found.');
		}

		if (!normalizedText) {
			return currentHandle;
		}

		const result = await client.mutation(api.chat.sendMessage, {
			conversationId: currentHandle.conversationId,
			resumeToken: currentHandle.resumeToken,
			text: normalizedText
		});

		return extendHandle(currentHandle, result.expiresAt);
	}

	function extend(expiresAt: number) {
		if (!handle) {
			throw new Error('Conversation not found.');
		}

		return extendHandle(handle, expiresAt);
	}

	function extendHandle(targetHandle: BuilderConversationHandle, expiresAt: number) {
		const nextHandle = {
			...targetHandle,
			expiresAt
		};

		if (sameHandle(handle, targetHandle)) {
			setHandle(nextHandle);
		}

		return nextHandle;
	}

	return {
		get handle() {
			return handle;
		},
		get status() {
			return status;
		},
		get error() {
			return error;
		},
		get isBusy() {
			return status === 'starting' || status === 'resuming';
		},
		clearLocal,
		dispose,
		extend,
		resume,
		start,
		send
	};
}
