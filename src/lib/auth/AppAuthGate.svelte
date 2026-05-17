<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { DEFAULT_ROUTE_HREF } from '$lib/app/app-routes';
	import AppGateError from '$lib/app/AppGateError.svelte';
	import AppLoadingScreen from '$lib/app/AppLoadingScreen.svelte';
	import AppShell from '$lib/app/AppShell.svelte';
	import { LoginFlow, OnboardingFlow } from '$lib/features/onboarding/flow';
	import {
		resolveAuthEntryPostAuthHref,
		resolveAuthEntryReturnHref,
		resolveAuthExitHref
	} from '$lib/features/onboarding/flow/auth-return';
	import type { Snippet } from 'svelte';
	import { createViewerSession, provideViewerSession } from './viewer-session.svelte';

	type AuthEntryRoute = 'signup' | 'login';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
	const session = createViewerSession();
	provideViewerSession(session);
	const authEntryRoute = $derived<AuthEntryRoute | undefined>(
		page.url.pathname === '/signup'
			? 'signup'
			: page.url.pathname === '/login'
				? 'login'
				: undefined
	);
	const onboardingKey = $derived(
		`${session.signedInUserId ?? 'signed-out'}:${authEntryRoute ?? 'app'}`
	);
	const postAuthHref = $derived(
		authEntryRoute
			? (resolveAuthEntryPostAuthHref(page.url) ?? DEFAULT_ROUTE_HREF)
			: `${page.url.pathname}${page.url.search}${page.url.hash}`
	);
	const exitHref = $derived(
		authEntryRoute
			? resolveAuthExitHref(page.url, {
					useDefaultWhenMissing: false
				})
			: undefined
	);
	const entryReturnHref = $derived(authEntryRoute ? resolveAuthEntryReturnHref(page.url) : undefined);
	const gateErrorText = $derived(session.error?.message ?? 'Unable to load your workspace.');
	const shouldRedirectSignedInAuthEntry = $derived(
		session.status === 'ready' && Boolean(authEntryRoute)
	);

	$effect(() => {
		if (shouldRedirectSignedInAuthEntry) {
			void goto(resolve(postAuthHref as '/'), { replaceState: true });
		}
	});
</script>

{#if shouldRedirectSignedInAuthEntry}
	<AppLoadingScreen />
{:else if session.status === 'ready' && session.viewer}
	<AppShell
		user={session.viewer.user}
		workspace={session.viewer.workspace}
	>
		{@render children()}
	</AppShell>
{:else if session.status === 'loading' || session.status === 'bootstrapping'}
	<AppLoadingScreen />
{:else if session.status === 'error'}
	<AppGateError message={gateErrorText} onRetry={session.retry} />
{:else}
	{#key onboardingKey}
		{#if authEntryRoute === 'signup'}
			<OnboardingFlow
				{exitHref}
				{entryReturnHref}
				isSignedIn={session.isSignedIn}
			/>
		{:else}
			<LoginFlow {exitHref} {entryReturnHref} />
		{/if}
	{/key}
{/if}
