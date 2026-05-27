<script module lang="ts">
	import type { AppHref, AuthEntryHref } from '$lib/app/app-links';
	import type { Snippet } from 'svelte';

	export type AuthEntryFlowContext = {
		returnTo: AppHref | undefined;
		returnButtonHref: string | undefined;
		entryReturnHref: AuthEntryHref | undefined;
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { AUTH_LINKS, resolveAppHref } from '$lib/app/app-links';
	import AppGateError from '$lib/app/AppGateError.svelte';
	import AppLoadingScreen from '$lib/app/AppLoadingScreen.svelte';
	import {
		resolveAuthEntryReturnHref,
		resolveAuthExitHref,
		resolveAuthReturnTo,
		resolvePostAuthHref,
		type AuthEntryPathname
	} from '$lib/auth/navigation';
	import { createViewerSession, provideViewerSession } from '$lib/auth/viewer-session.svelte';

	type Props = {
		entry: AuthEntryPathname;
		flow: Snippet<[AuthEntryFlowContext]>;
		signedInOnboarding?: Snippet<[AuthEntryFlowContext]>;
	};

	let { entry, flow, signedInOnboarding }: Props = $props();
	const session = createViewerSession();
	provideViewerSession(session);
	const authEntryKey = $derived(`${session.signedInUserId ?? 'signed-out'}:${entry}`);
	const returnTo = $derived(resolveAuthReturnTo(page.url));
	const postAuthHref = $derived(resolvePostAuthHref(page.url));
	const returnButtonHref = $derived(
		resolveAuthExitHref(page.url, {
			useDefaultWhenMissing: false
		})
	);
	const entryReturnHref = $derived(resolveAuthEntryReturnHref(page.url));
	const gateErrorText = $derived(session.error?.message ?? 'Unable to load your workspace.');
	const flowContext = $derived<AuthEntryFlowContext>({
		returnTo,
		returnButtonHref,
		entryReturnHref
	});
	const signedInNeedsWorkspaceOnboarding = $derived(
		session.status === 'ready' &&
			entry === AUTH_LINKS.join.pathname &&
			Boolean(session.viewer) &&
			!session.viewer?.workspace.onboardingCompletedAt
	);
	const shouldRenderSignedInOnboarding = $derived(
		signedInNeedsWorkspaceOnboarding && Boolean(signedInOnboarding)
	);
	const shouldRedirectSignedInAuthEntry = $derived(
		session.status === 'ready' && Boolean(session.viewer) && !shouldRenderSignedInOnboarding
	);

	$effect(() => {
		if (shouldRedirectSignedInAuthEntry) {
			void goto(resolveAppHref(postAuthHref), { replaceState: true });
		}
	});
</script>

{#if shouldRedirectSignedInAuthEntry}
	<AppLoadingScreen />
{:else if shouldRenderSignedInOnboarding}
	{#key authEntryKey}
		{@render signedInOnboarding?.(flowContext)}
	{/key}
{:else if session.status === 'loading' || session.status === 'bootstrapping'}
	<AppLoadingScreen />
{:else if session.status === 'error'}
	<AppGateError message={gateErrorText} onRetry={session.retry} />
{:else}
	{#key authEntryKey}
		{@render flow(flowContext)}
	{/key}
{/if}
