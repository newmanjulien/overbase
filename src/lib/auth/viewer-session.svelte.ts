import { api } from '$convex/_generated/api';
import type { Doc } from '$convex/_generated/dataModel';
import { getContext, setContext } from 'svelte';
import { useConvexClient, useQuery } from 'convex-svelte';
import { useClerkContext } from 'svelte-clerk';

export type ViewerSessionStatus = 'loading' | 'signedOut' | 'bootstrapping' | 'ready' | 'error';

export type ViewerWorkspace = {
	user: Doc<'users'>;
	workspace: Doc<'workspaces'>;
	identityEmail: string;
	identityName?: string;
};

type CurrentUserAndWorkspace = {
	user: Doc<'users'>;
	workspace: Doc<'workspaces'> | null;
	identityEmail: string;
	identityName?: string;
} | null;

const VIEWER_SESSION_CONTEXT = Symbol('viewer-session');

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}

export function createViewerSession() {
	const client = useConvexClient();
	const clerk = useClerkContext();
	let authVersion = 0;
	let authRetryNonce = $state(0);
	let convexAuthReady = $state(false);
	let tokenErrorText = $state<string | null>(null);
	let bootstrappingUserId = $state<string | null>(null);
	let bootstrappedUserId = $state<string | null>(null);
	let bootstrapErrorText = $state<string | null>(null);
	let ensuredViewer = $state<ViewerWorkspace | null>(null);
	const signedInUserId = $derived(clerk.auth.userId ?? null);
	const shouldLoadCurrentUser = $derived(
		clerk.isLoaded && Boolean(signedInUserId) && convexAuthReady
	);
	const currentUserAndWorkspaceQuery = useQuery(api.auth.currentUserAndWorkspace, () =>
		shouldLoadCurrentUser ? {} : 'skip'
	);
	const currentUserAndWorkspace = $derived<CurrentUserAndWorkspace>(
		currentUserAndWorkspaceQuery.data ?? null
	);
	const viewer = $derived.by<ViewerWorkspace | null>(() => {
		const currentViewer = currentUserAndWorkspace;

		if (currentViewer?.workspace) {
			return {
				user: currentViewer.user,
				workspace: currentViewer.workspace,
				identityEmail: currentViewer.identityEmail,
				identityName: currentViewer.identityName
			};
		}

		return ensuredViewer;
	});
	const error = $derived.by<Error | null>(() => {
		const message = tokenErrorText ?? bootstrapErrorText;

		if (message) {
			return new Error(message);
		}

		return currentUserAndWorkspaceQuery.error ?? null;
	});
	const status = $derived.by<ViewerSessionStatus>(() => {
		if (!clerk.isLoaded) {
			return 'loading';
		}

		if (!signedInUserId) {
			return 'signedOut';
		}

		if (error) {
			return 'error';
		}

		if (!convexAuthReady || currentUserAndWorkspaceQuery.isLoading) {
			return 'loading';
		}

		if (!viewer) {
			return 'bootstrapping';
		}

		return 'ready';
	});

	function resetBootstrapState() {
		bootstrappingUserId = null;
		bootstrappedUserId = null;
		bootstrapErrorText = null;
		ensuredViewer = null;
	}

	async function bootstrapCurrentUser(userId: string) {
		if (bootstrappingUserId || bootstrappedUserId === userId) {
			return;
		}

		bootstrappingUserId = userId;
		bootstrappedUserId = userId;
		bootstrapErrorText = null;

		try {
			ensuredViewer = await client.mutation(api.auth.ensureViewerWorkspace, {});
		} catch (error) {
			bootstrapErrorText = getErrorMessage(error, 'Unable to create your workspace.');
		} finally {
			bootstrappingUserId = null;
		}
	}

	function retry() {
		tokenErrorText = null;
		authRetryNonce += 1;
		resetBootstrapState();

		if (signedInUserId && convexAuthReady) {
			void bootstrapCurrentUser(signedInUserId);
		}
	}

	function reset() {
		tokenErrorText = null;
		resetBootstrapState();
	}

	async function signOut() {
		reset();
		await clerk.clerk?.signOut();
	}

	$effect(() => {
		const userId = signedInUserId;
		const session = clerk.session;
		const retryNonce = authRetryNonce;
		const version = (authVersion += 1);

		void retryNonce;
		convexAuthReady = false;
		tokenErrorText = null;

		if (!clerk.isLoaded) {
			return;
		}

		if (!userId) {
			client.setAuth(async () => null);
			convexAuthReady = true;
			return;
		}

		if (!session) {
			return;
		}

		client.setAuth(async () => {
			let token: string | null;

			try {
				token = await session.getToken({ template: 'convex' });
			} catch (error) {
				tokenErrorText = getErrorMessage(error, 'Unable to get a Convex auth token from Clerk.');
				return null;
			}

			if (!token) {
				tokenErrorText =
					'Unable to get a Convex auth token from Clerk. Check the Clerk JWT template named "convex".';
			}

			return token ?? null;
		}, (isAuthenticated) => {
			if (version === authVersion) {
				convexAuthReady = isAuthenticated;
			}
		});
	});

	$effect(() => {
		const userId = signedInUserId;

		if (!userId) {
			resetBootstrapState();
			return;
		}

		if (bootstrappedUserId && bootstrappedUserId !== userId) {
			resetBootstrapState();
		}
	});

	$effect(() => {
		const userId = signedInUserId;

		if (
			!userId ||
			!convexAuthReady ||
			currentUserAndWorkspaceQuery.isLoading ||
			currentUserAndWorkspaceQuery.error ||
			currentUserAndWorkspace?.workspace ||
			ensuredViewer
		) {
			return;
		}

		void bootstrapCurrentUser(userId);
	});

	return {
		get status() {
			return status;
		},
		get isSignedIn() {
			return Boolean(signedInUserId);
		},
		get signedInUserId() {
			return signedInUserId;
		},
		get currentUserAndWorkspace() {
			return currentUserAndWorkspace;
		},
		get viewer() {
			return viewer;
		},
		get error() {
			return error;
		},
		retry,
		reset,
		signOut
	};
}

export type ViewerSession = ReturnType<typeof createViewerSession>;

export function provideViewerSession(session: ViewerSession) {
	setContext(VIEWER_SESSION_CONTEXT, session);
}

export function useViewerSession() {
	const session = getContext<ViewerSession | undefined>(VIEWER_SESSION_CONTEXT);

	if (!session) {
		throw new Error('No viewer session context was found.');
	}

	return session;
}
