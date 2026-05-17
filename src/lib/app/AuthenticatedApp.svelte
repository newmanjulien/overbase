<script lang="ts">
	import AppAuthGate from '$lib/auth/AppAuthGate.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<AppAuthGate>
	{@render children()}
</AppAuthGate>
