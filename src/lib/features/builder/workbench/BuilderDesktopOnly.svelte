<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount, type Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
	};

	let { children }: Props = $props();

	onMount(() => {
		const mediaQuery = window.matchMedia('(max-width: 767px)');

		if (mediaQuery.matches) {
			void goto(resolve('/formats'), { replaceState: true });
		}
	});
</script>

<div class="hidden h-full min-h-full min-w-0 md:block">
	{@render children?.()}
</div>
