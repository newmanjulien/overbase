<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import AppGateError from '$lib/app/AppGateError.svelte';
	import AppLoadingScreen from '$lib/app/AppLoadingScreen.svelte';
	import AppShell from '$lib/app/AppShell.svelte';
	import { LoginFlow } from '$lib/auth/login';
	import { JoinFlow } from '$lib/auth/onboarding';
	import {
		isAuthEntryPathname,
		resolveAuthReturnTo,
		resolveAuthEntryReturnHref,
		resolveAuthExitHref,
		resolvePostAuthHref
	} from '$lib/auth/navigation';
	import type { Snippet } from 'svelte';
	import { createViewerSession, provideViewerSession } from './viewer-session.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
	const session = createViewerSession();
	provideViewerSession(session);
	const authEntryRoute = $derived(
		isAuthEntryPathname(page.url.pathname) ? page.url.pathname : undefined
	);
	const authEntryKey = $derived(
		`${session.signedInUserId ?? 'signed-out'}:${authEntryRoute ?? 'app'}`
	);
	const returnTo = $derived(resolveAuthReturnTo(page.url));
	const postAuthHref = $derived(resolvePostAuthHref(page.url));
	const returnButtonHref = $derived(
		authEntryRoute
			? resolveAuthExitHref(page.url, {
					useDefaultWhenMissing: false
				})
			: undefined
	);
	const entryReturnHref = $derived(authEntryRoute ? resolveAuthEntryReturnHref(page.url) : undefined);
	const gateErrorText = $derived(session.error?.message ?? 'Unable to load your workspace.');
	const shouldShowJoinOnboarding = $derived(
		session.status === 'ready' &&
			authEntryRoute === '/join' &&
			Boolean(session.viewer) &&
			!session.viewer?.workspace.onboardingCompletedAt
	);
	const shouldRedirectSignedInAuthEntry = $derived(
		session.status === 'ready' && Boolean(authEntryRoute) && !shouldShowJoinOnboarding
	);

	$effect(() => {
		if (shouldRedirectSignedInAuthEntry) {
			void goto(resolve(postAuthHref as '/'), { replaceState: true });
		}
	});
</script>

{#if shouldRedirectSignedInAuthEntry}
	<AppLoadingScreen />
{:else if shouldShowJoinOnboarding}
	{#key authEntryKey}
		<JoinFlow
			{returnTo}
			{returnButtonHref}
			{entryReturnHref}
			initialStep="company"
			isSignedIn
		/>
	{/key}
{:else if session.status === 'ready' && session.viewer}
	<AppShell
		user={session.viewer.user}
		workspace={session.viewer.workspace}
		identity={session.viewer.identity}
	>
		{@render children()}
	</AppShell>
{:else if session.status === 'loading' || session.status === 'bootstrapping'}
	<AppLoadingScreen />
{:else if session.status === 'error'}
	<AppGateError message={gateErrorText} onRetry={session.retry} />
{:else}
	{#key authEntryKey}
		{#if authEntryRoute === '/join'}
			<JoinFlow {returnTo} {returnButtonHref} {entryReturnHref} />
		{:else}
			<LoginFlow {returnTo} {returnButtonHref} {entryReturnHref} />
		{/if}
	{/key}
{/if}
