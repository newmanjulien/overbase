<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import { cn } from '$lib/chrome/shared/cn';
	import ResourceActionButton from '$lib/resource-index/ResourceActionButton.svelte';
	import ResourceSearchInput from '$lib/resource-index/ResourceSearchInput.svelte';

	type Props = {
		searchPlaceholder: string;
		searchAriaLabel?: string;
		filterLabel?: string;
		actionLabel?: string;
		class?: string;
	};

	let {
		searchPlaceholder,
		searchAriaLabel,
		filterLabel,
		actionLabel,
		class: className = ''
	}: Props = $props();
</script>

<div class={cn('flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-2.5', className)}>
	<ResourceSearchInput
		placeholder={searchPlaceholder}
		ariaLabel={searchAriaLabel}
		class="w-full md:flex-1"
	/>

	<div class="flex shrink-0 items-center gap-2 md:gap-2.5">
		{#if filterLabel}
			<button
				type="button"
				class="inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-sm border border-zinc-200 bg-white px-3 text-[0.76rem] font-normal text-zinc-950 transition-colors hover:bg-zinc-50 md:flex-none md:px-3.5 md:text-[0.78rem]"
			>
				<span>{filterLabel}</span>
				<ChevronDown aria-hidden="true" class="size-3.5 text-zinc-600" />
			</button>
		{/if}

		{#if actionLabel}
			<ResourceActionButton label={actionLabel} class="flex-1 md:flex-none" />
		{/if}
	</div>
</div>
