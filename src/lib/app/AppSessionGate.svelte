<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import AppGateError from '$lib/app/AppGateError.svelte';
	import AppLoadingScreen from '$lib/app/AppLoadingScreen.svelte';
	import AppShell from '$lib/app/AppShell.svelte';
	import { AUTH_LINKS } from '$lib/app/app-links';
	import { buildAuthEntryHref, resolveAuthReturnTo } from '$lib/auth/navigation';
	import { createViewerSession, provideViewerSession } from '$lib/auth/viewer-session.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
	const session = createViewerSession();
	provideViewerSession(session);
	const loginHref = $derived(
		buildAuthEntryHref(AUTH_LINKS.login.pathname, {
			returnTo: resolveAuthReturnTo(page.url)
		})
	);
	const gateErrorText = $derived(session.error?.message ?? 'Unable to load your workspace.');

	$effect(() => {
		if (session.status === 'signedOut') {
			void goto(resolve(loginHref), { replaceState: true });
		}
	});
</script>

{#if session.status === 'ready' && session.viewer}
	<AppShell
		user={session.viewer.user}
		workspace={session.viewer.workspace}
		identity={session.viewer.identity}
	>
		{@render children()}
	</AppShell>
{:else if session.status === 'error'}
	<AppGateError message={gateErrorText} onRetry={session.retry} />
{:else}
	<AppLoadingScreen />
{/if}
