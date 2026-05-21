import { api } from '$convex/_generated/api';
import type { Doc } from '$convex/_generated/dataModel';
import type { ViewerIdentity } from '$lib/app/current-workspace.svelte';
import { getContext, setContext } from 'svelte';
import { useConvexClient, useQuery } from 'convex-svelte';
import { useClerkContext } from 'svelte-clerk';

export type ViewerSessionStatus = 'loading' | 'signedOut' | 'bootstrapping' | 'ready' | 'error';
type ClerkSessionState = 'loading' | 'signedOut' | 'signedIn';
type ConvexAuthState = 'pending' | 'authenticated' | 'failed';
type ViewerBootstrapState = 'missing' | 'bootstrapping' | 'ready' | 'error';

export type ViewerWorkspace = {
	user: Doc<'users'>;
	workspace: Doc<'workspaces'>;
	identity: ViewerIdentity;
};

type CurrentUserAndWorkspace = {
	user: Doc<'users'>;
	workspace: Doc<'workspaces'> | null;
	identity: ViewerIdentity;
} | null;

type ViewerPayload = {
	user?: Doc<'users'>;
	workspace?: Doc<'workspaces'> | null;
	identity?: Partial<ViewerIdentity> | null;
};

type LiveViewerResult = {
	raw: CurrentUserAndWorkspace;
	viewer: ViewerWorkspace | null;
	error: Error | null;
};

const VIEWER_SESSION_CONTEXT = Symbol('viewer-session');

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}

function getViewerIdentity(payload: ViewerPayload) {
	const email = typeof payload.identity?.email === 'string' ? payload.identity.email.trim() : '';

	if (!email) {
		throw new Error("Viewer session is missing the user's email address.");
	}

	return { email };
}

function normalizeViewerWorkspace(payload: ViewerPayload | null | undefined): ViewerWorkspace | null {
	if (!payload?.workspace) {
		return null;
	}

	if (!payload.user) {
		throw new Error('Viewer session is missing the user.');
	}

	return {
		user: payload.user,
		workspace: payload.workspace,
		identity: getViewerIdentity(payload)
	};
}

export function createViewerSession() {
	const client = useConvexClient();
	const clerk = useClerkContext();
	let authVersion = 0;
	let authRetryNonce = $state(0);
	let convexAuthState = $state<ConvexAuthState>('pending');
	let tokenErrorText = $state<string | null>(null);
	let convexAuthErrorText = $state<string | null>(null);
	let bootstrappingUserId = $state<string | null>(null);
	let bootstrapAttemptedUserId = $state<string | null>(null);
	let bootstrapErrorText = $state<string | null>(null);
	let ensuredViewer = $state<ViewerWorkspace | null>(null);
	const signedInUserId = $derived(clerk.auth.userId ?? null);
	const clerkSessionState = $derived.by<ClerkSessionState>(() => {
		if (!clerk.isLoaded) {
			return 'loading';
		}

		return signedInUserId ? 'signedIn' : 'signedOut';
	});
	const shouldLoadCurrentUser = $derived(
		clerkSessionState === 'signedIn' && convexAuthState === 'authenticated'
	);
	const currentUserAndWorkspaceQuery = useQuery(api.auth.currentUserAndWorkspace, () =>
		shouldLoadCurrentUser ? {} : 'skip'
	);
	const liveViewerResult = $derived.by<LiveViewerResult>(() => {
		const payload = currentUserAndWorkspaceQuery.data ?? null;

		if (!payload) {
			return {
				raw: null,
				viewer: null,
				error: null
			};
		}

		try {
			return {
				raw: payload,
				viewer: normalizeViewerWorkspace(payload),
				error: null
			};
		} catch (error) {
			return {
				raw: null,
				viewer: null,
				error: new Error(getErrorMessage(error, 'Viewer session is malformed.'))
			};
		}
	});
	const currentUserAndWorkspace = $derived<CurrentUserAndWorkspace>(liveViewerResult.raw);
	const liveViewer = $derived<ViewerWorkspace | null>(liveViewerResult.viewer);
	const liveViewerError = $derived<Error | null>(liveViewerResult.error);
	const viewer = $derived.by<ViewerWorkspace | null>(() => {
		if (liveViewer) {
			return liveViewer;
		}

		return ensuredViewer;
	});
	const error = $derived.by<Error | null>(() => {
		const message =
			tokenErrorText ??
			convexAuthErrorText ??
			liveViewerError?.message ??
			bootstrapErrorText;

		if (message) {
			return new Error(message);
		}

		return currentUserAndWorkspaceQuery.error ?? null;
	});
	const viewerBootstrapState = $derived.by<ViewerBootstrapState>(() => {
		if (bootstrapErrorText || liveViewerError || currentUserAndWorkspaceQuery.error) {
			return 'error';
		}

		if (viewer) {
			return 'ready';
		}

		if (bootstrappingUserId) {
			return 'bootstrapping';
		}

		return 'missing';
	});
	const status = $derived.by<ViewerSessionStatus>(() => {
		if (clerkSessionState === 'loading') {
			return 'loading';
		}

		if (clerkSessionState === 'signedOut') {
			return 'signedOut';
		}

		if (convexAuthState === 'failed') {
			return 'error';
		}

		if (viewerBootstrapState === 'error') {
			return 'error';
		}

		if (viewerBootstrapState === 'ready') {
			return 'ready';
		}

		if (convexAuthState === 'pending') {
			return 'loading';
		}

		if (currentUserAndWorkspaceQuery.isLoading) {
			return 'loading';
		}

		return 'bootstrapping';
	});

	function resetBootstrapState() {
		bootstrappingUserId = null;
		bootstrapAttemptedUserId = null;
		bootstrapErrorText = null;
		ensuredViewer = null;
	}

	async function bootstrapCurrentUser(userId: string) {
		if (bootstrappingUserId || bootstrapAttemptedUserId === userId) {
			return;
		}

		bootstrappingUserId = userId;
		bootstrapAttemptedUserId = userId;
		bootstrapErrorText = null;

		try {
			const nextViewer = normalizeViewerWorkspace(
				await client.mutation(api.auth.ensureViewerWorkspace, {})
			);

			if (!nextViewer) {
				throw new Error('Workspace required.');
			}

			ensuredViewer = nextViewer;
		} catch (error) {
			bootstrapErrorText = getErrorMessage(error, 'Unable to create your workspace.');
		} finally {
			bootstrappingUserId = null;
		}
	}

	function retry() {
		tokenErrorText = null;
		convexAuthErrorText = null;
		authRetryNonce += 1;
		resetBootstrapState();
	}

	function reset() {
		tokenErrorText = null;
		convexAuthErrorText = null;
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
		convexAuthState = 'pending';
		tokenErrorText = null;
		convexAuthErrorText = null;

		if (!clerk.isLoaded) {
			return;
		}

		if (!userId) {
			client.setAuth(async () => null);
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
			if (version !== authVersion) {
				return;
			}

			if (isAuthenticated) {
				convexAuthState = 'authenticated';
				convexAuthErrorText = null;
				return;
			}

			convexAuthState = 'failed';
			convexAuthErrorText =
				tokenErrorText ??
				'Unable to authenticate with Convex. Check the Clerk JWT template named "convex".';
		});
	});

	$effect(() => {
		const userId = signedInUserId;

		if (!userId) {
			resetBootstrapState();
			return;
		}

		if (bootstrapAttemptedUserId && bootstrapAttemptedUserId !== userId) {
			resetBootstrapState();
		}
	});

	$effect(() => {
		const userId = signedInUserId;

		if (
			!userId ||
			convexAuthState !== 'authenticated' ||
			currentUserAndWorkspaceQuery.isLoading ||
			liveViewerError ||
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
