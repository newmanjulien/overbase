<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/ui/cn';

	type Props = {
		toolbar?: Snippet;
		footer?: Snippet;
		children?: Snippet;
		class?: string;
		contentClass?: string;
	};

	let {
		toolbar,
		footer,
		children,
		class: className = '',
		contentClass = ''
	}: Props = $props();
</script>

<div class={cn('mx-auto flex min-h-full w-full max-w-320 flex-col gap-3 pb-12', className)}>
	{@render toolbar?.()}

	<section
		class={cn('min-h-0 overflow-hidden rounded-sm border border-stone-200/70 bg-white', contentClass)}
		aria-label="List results"
	>
		{@render children?.()}
	</section>

	{@render footer?.()}
</div>
