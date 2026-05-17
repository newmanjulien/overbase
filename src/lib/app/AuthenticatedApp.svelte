<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { api } from '$convex/_generated/api';
	import { APP_CONFIG } from '$lib/app/app-config';
	import { DEFAULT_ROUTE_HREF } from '$lib/app/app-routes';
	import AppGateError from '$lib/app/AppGateError.svelte';
	import AppLoadingScreen from '$lib/app/AppLoadingScreen.svelte';
	import AppShell from '$lib/app/AppShell.svelte';
	import ConvexClerkAuthBridge from '$lib/backend/convex/ConvexClerkAuthBridge.svelte';
	import {
		getOnboardingStepForWorkspace,
		LoginFlow,
		OnboardingFlow,
		type OnboardingStep,
		type WorkspaceOnboardingStep
	} from '$lib/features/onboarding/flow';
	import {
		deriveAuthReturnButtonHrefFromRoute,
		resolveAuthReturnButtonHref
	} from '$lib/features/onboarding/flow/auth-return';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import type { Snippet } from 'svelte';
	import { useClerkContext } from 'svelte-clerk';

	type AuthGateStatus = 'loading' | 'signedOut' | 'ready' | 'error';
	type AuthEntryRoute = 'signup' | 'login';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
	const client = useConvexClient();
	const clerk = useClerkContext();
	let convexAuthReady = $state(false);
	let bootstrapInFlight = $state(false);
	let bootstrapErrorText = $state<string | null>(null);
	let bootstrapAttemptedForUserId = $state<string | null>(null);

	const signedInUserId = $derived(clerk.auth.userId ?? null);
	const authEntryRoute = $derived<AuthEntryRoute | undefined>(
		page.url.pathname === '/signup'
			? 'signup'
			: page.url.pathname === '/login'
				? 'login'
				: undefined
	);
	const shouldLoadCurrentUser = $derived(
		clerk.isLoaded && Boolean(signedInUserId) && convexAuthReady
	);
	const currentUser = useQuery(api.auth.currentUserAndWorkspace, () =>
		shouldLoadCurrentUser ? {} : 'skip'
	);
	const authGateStatus = $derived.by<AuthGateStatus>(() => {
		if (!clerk.isLoaded) {
			return 'loading';
		}

		if (!signedInUserId) {
			return 'signedOut';
		}

		if (!convexAuthReady || currentUser.isLoading || bootstrapInFlight) {
			return 'loading';
		}

		if (currentUser.error || bootstrapErrorText) {
			return 'error';
		}

		if (!currentUser.data?.workspace) {
			return 'loading';
		}

		return 'ready';
	});
	const signupOnboardingStep = $derived.by<WorkspaceOnboardingStep>(() => {
		if (
			authGateStatus !== 'ready' ||
			authEntryRoute !== 'signup' ||
			!APP_CONFIG.onboarding.enabled
		) {
			return 'complete';
		}

		return getOnboardingStepForWorkspace(currentUser.data?.workspace);
	});
	const onboardingInitialStep = $derived<OnboardingStep>(
		signupOnboardingStep === 'company'
			? 'company'
			: signupOnboardingStep === 'partner'
				? 'partner'
				: 'welcome'
	);
	const onboardingKey = $derived(
		`${signedInUserId ?? 'signed-out'}:${authEntryRoute ?? 'app'}:${onboardingInitialStep}`
	);
	const authReturnButtonHref = $derived(
		authEntryRoute
			? resolveAuthReturnButtonHref(page.url, {
					useDefaultWhenMissing: true
				})
			: deriveAuthReturnButtonHrefFromRoute(page.url)
	);
	const gateErrorText = $derived(
		bootstrapErrorText ?? currentUser.error?.message ?? 'Unable to load your workspace.'
	);
	const shouldRedirectSignedInAuthEntry = $derived(
		authGateStatus === 'ready' &&
			(authEntryRoute === 'login' ||
				(authEntryRoute === 'signup' && signupOnboardingStep === 'complete'))
	);

	async function bootstrapCurrentUser(userId: string) {
		if (bootstrapInFlight || bootstrapAttemptedForUserId === userId) {
			return;
		}

		bootstrapInFlight = true;
		bootstrapErrorText = null;
		bootstrapAttemptedForUserId = userId;

		try {
			await client.mutation(api.auth.ensureViewerWorkspace, {});
		} catch (error) {
			bootstrapErrorText = error instanceof Error ? error.message : 'Unable to create your workspace.';
		} finally {
			bootstrapInFlight = false;
		}
	}

	function retryBootstrap() {
		bootstrapAttemptedForUserId = null;
		bootstrapErrorText = null;
		if (signedInUserId) {
			void bootstrapCurrentUser(signedInUserId);
		}
	}

	$effect(() => {
		if (!signedInUserId) {
			bootstrapInFlight = false;
			bootstrapErrorText = null;
			bootstrapAttemptedForUserId = null;
			return;
		}

		if (bootstrapAttemptedForUserId && bootstrapAttemptedForUserId !== signedInUserId) {
			bootstrapInFlight = false;
			bootstrapErrorText = null;
			bootstrapAttemptedForUserId = null;
		}
	});

	$effect(() => {
		if (
			!signedInUserId ||
			!convexAuthReady ||
			currentUser.isLoading ||
			currentUser.error ||
			currentUser.data?.workspace
		) {
			return;
		}

		void bootstrapCurrentUser(signedInUserId);
	});

	$effect(() => {
		if (shouldRedirectSignedInAuthEntry) {
			void goto(resolve(DEFAULT_ROUTE_HREF), { replaceState: true });
		}
	});
</script>

<ConvexClerkAuthBridge bind:isReady={convexAuthReady} />

{#if shouldRedirectSignedInAuthEntry}
	<AppLoadingScreen />
{:else if authGateStatus === 'ready' && authEntryRoute === 'signup' && signupOnboardingStep !== 'complete'}
	{#key onboardingKey}
		<OnboardingFlow initialStep={onboardingInitialStep} {authReturnButtonHref} />
	{/key}
{:else if authGateStatus === 'ready' && currentUser.data?.user && currentUser.data.workspace}
	<AppShell
		user={currentUser.data.user}
		workspace={currentUser.data.workspace}
	>
		{@render children()}
	</AppShell>
{:else if authGateStatus === 'loading'}
	<AppLoadingScreen />
{:else if authGateStatus === 'error'}
	<AppGateError message={gateErrorText} onRetry={retryBootstrap} />
{:else}
	{#key onboardingKey}
		{#if authEntryRoute === 'signup'}
			<OnboardingFlow initialStep={onboardingInitialStep} {authReturnButtonHref} />
		{:else}
			<LoginFlow {authReturnButtonHref} />
		{/if}
	{/key}
{/if}
