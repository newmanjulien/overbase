<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { api } from '$convex/_generated/api';
	import { APP_CONFIG } from '$lib/app/app-config';
	import { AUTH_ENTRY_ROUTE_HREFS, DEFAULT_ROUTE_HREF } from '$lib/app/app-routes';
	import AppGateError from '$lib/app/AppGateError.svelte';
	import AppLoadingScreen from '$lib/app/AppLoadingScreen.svelte';
	import AppShell from '$lib/app/AppShell.svelte';
	import ConvexClerkAuthBridge from '$lib/backend/convex/ConvexClerkAuthBridge.svelte';
	import {
		getOnboardingStepForWorkspace,
		OnboardingFlow,
		type OnboardingStep
	} from '$lib/features/onboarding/flow';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import type { Snippet } from 'svelte';
	import { useClerkContext } from 'svelte-clerk';

	type GateStatus = 'loading' | 'signedOut' | 'company' | 'partner' | 'complete' | 'error';

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
	const isAuthEntryRoute = $derived(
		AUTH_ENTRY_ROUTE_HREFS.some((href) => page.url.pathname === href)
	);
	const shouldLoadCurrentUser = $derived(
		clerk.isLoaded && Boolean(signedInUserId) && convexAuthReady
	);
	const currentUser = useQuery(api.auth.currentUserAndWorkspace, () =>
		shouldLoadCurrentUser ? {} : 'skip'
	);
	const gateStatus = $derived.by<GateStatus>(() => {
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

		if (!APP_CONFIG.onboarding.enabled) {
			return 'complete';
		}

		return getOnboardingStepForWorkspace(currentUser.data.workspace);
	});
	const onboardingInitialStep = $derived<OnboardingStep>(
		gateStatus === 'company'
			? 'company'
			: gateStatus === 'partner'
				? 'partner'
				: page.url.pathname === '/login'
					? 'signup'
					: 'welcome'
	);
	const onboardingKey = $derived(`${signedInUserId ?? 'signed-out'}:${onboardingInitialStep}`);
	const gateErrorText = $derived(
		bootstrapErrorText ?? currentUser.error?.message ?? 'Unable to load your workspace.'
	);

	async function bootstrapCurrentUser(userId: string) {
		if (bootstrapInFlight || bootstrapAttemptedForUserId === userId) {
			return;
		}

		bootstrapInFlight = true;
		bootstrapErrorText = null;
		bootstrapAttemptedForUserId = userId;

		try {
			await client.mutation(api.auth.bootstrapCurrentUserAndWorkspace, {});
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
		if (gateStatus === 'complete' && isAuthEntryRoute) {
			void goto(resolve(DEFAULT_ROUTE_HREF), { replaceState: true });
		}
	});
</script>

<ConvexClerkAuthBridge bind:isReady={convexAuthReady} />

{#if gateStatus === 'complete' && isAuthEntryRoute}
	<AppLoadingScreen />
{:else if gateStatus === 'complete' && currentUser.data?.user && currentUser.data.workspace && currentUser.data.membership}
	<AppShell
		user={currentUser.data.user}
		workspace={currentUser.data.workspace}
		membership={currentUser.data.membership}
	>
		{@render children()}
	</AppShell>
{:else if gateStatus === 'loading' || gateStatus === 'complete'}
	<AppLoadingScreen />
{:else if gateStatus === 'error'}
	<AppGateError message={gateErrorText} onRetry={retryBootstrap} />
{:else}
	{#key onboardingKey}
		<OnboardingFlow initialStep={onboardingInitialStep} />
	{/key}
{/if}
