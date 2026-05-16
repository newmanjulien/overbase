<script lang="ts">
	import { setupAppConvex } from '$lib/backend/convex/setup.svelte';
	import { ClerkProvider } from 'svelte-clerk';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
	setupAppConvex();
</script>

<ClerkProvider>
	{@render children()}
</ClerkProvider>
