<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/cn';

	type Props = {
		children?: Snippet;
		class?: string;
	};

	let { children, class: className = '' }: Props = $props();
</script>

<section class={cn('flex h-full min-h-full w-full px-4 py-6 md:px-8 md:py-8', className)}>
	<div class="min-h-0 min-w-0 flex-1">
		{@render children?.()}
	</div>
</section>
