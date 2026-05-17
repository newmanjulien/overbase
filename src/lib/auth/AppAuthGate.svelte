<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import AppGateError from '$lib/app/AppGateError.svelte';
	import AppLoadingScreen from '$lib/app/AppLoadingScreen.svelte';
	import AppShell from '$lib/app/AppShell.svelte';
	import {
		isAuthEntryPathname,
		LoginFlow,
		resolveAuthReturnTo,
		resolveAuthEntryReturnHref,
		resolveAuthExitHref,
		resolvePostAuthHref,
		SignupFlow
	} from '$lib/auth/entry';
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
	const shouldShowSignupOnboarding = $derived(
		session.status === 'ready' &&
			authEntryRoute === '/signup' &&
			Boolean(session.viewer) &&
			!session.viewer?.workspace.onboardingCompletedAt
	);
	const shouldRedirectSignedInAuthEntry = $derived(
		session.status === 'ready' && Boolean(authEntryRoute) && !shouldShowSignupOnboarding
	);

	$effect(() => {
		if (shouldRedirectSignedInAuthEntry) {
			void goto(resolve(postAuthHref as '/'), { replaceState: true });
		}
	});
</script>

{#if shouldRedirectSignedInAuthEntry}
	<AppLoadingScreen />
{:else if shouldShowSignupOnboarding}
	{#key authEntryKey}
		<SignupFlow
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
	>
		{@render children()}
	</AppShell>
{:else if session.status === 'loading' || session.status === 'bootstrapping'}
	<AppLoadingScreen />
{:else if session.status === 'error'}
	<AppGateError message={gateErrorText} onRetry={session.retry} />
{:else}
	{#key authEntryKey}
		{#if authEntryRoute === '/signup'}
			<SignupFlow {returnTo} {returnButtonHref} {entryReturnHref} />
		{:else}
			<LoginFlow {returnTo} {returnButtonHref} {entryReturnHref} />
		{/if}
	{/key}
{/if}
