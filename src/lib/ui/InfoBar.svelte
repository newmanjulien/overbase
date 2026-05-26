<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'clsx';
	import { cn } from '$lib/ui/cn';

	type Props = {
		label?: string;
		class?: ClassValue;
		children?: Snippet;
	};

	let { label, class: className = '', children }: Props = $props();

	const infoBarClass = $derived(
		cn(
			'w-full rounded-[0.45rem] border border-blue-100/60 bg-blue-50/30 px-4 py-3 text-[0.76rem] leading-relaxed text-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
			className
		)
	);
</script>

<aside class={infoBarClass}>
	{#if label}
		<span class="font-semibold text-stone-950">{label}</span>
	{/if}
	{#if children}
		<span class={label ? 'ml-1' : undefined}>
			{@render children()}
		</span>
	{/if}
</aside>
