<script lang="ts">
	import { cn } from '$lib/ui/cn';
	import type { ListFilterConfig } from '$lib/patterns/list-page/types';
	import ListActionButton from '$lib/patterns/list-page/ListActionButton.svelte';
	import ListFilterControl from '$lib/patterns/list-page/ListFilterControl.svelte';
	import ListSearchInput from '$lib/patterns/list-page/ListSearchInput.svelte';

	type Props = {
		searchPlaceholder?: string;
		searchAriaLabel?: string;
		searchValue?: string;
		onSearchValueChange?: (value: string) => void;
		filter?: ListFilterConfig;
		actionLabel?: string;
		onAction?: () => void;
		class?: string;
	};

	let {
		searchPlaceholder,
		searchAriaLabel,
		searchValue = '',
		onSearchValueChange,
		filter,
		actionLabel,
		onAction,
		class: className = ''
	}: Props = $props();
</script>

<div class={cn('flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-2.5', className)}>
	{#if searchPlaceholder}
		<ListSearchInput
			placeholder={searchPlaceholder}
			ariaLabel={searchAriaLabel}
			value={searchValue}
			onValueChange={onSearchValueChange}
			readonly={!onSearchValueChange}
			class="w-full md:min-w-0 md:flex-1"
		/>
	{/if}

	<div
		class={cn(
			'items-center gap-2 md:gap-2.5',
			searchPlaceholder ? 'hidden md:flex md:shrink-0' : 'flex w-full justify-end md:w-auto'
		)}
	>
		{#if filter}
			<ListFilterControl {filter} class="flex-1 md:flex-none" />
		{/if}

		{#if actionLabel}
			<ListActionButton label={actionLabel} class="flex-1 md:flex-none" onclick={onAction} />
		{/if}
	</div>
</div>
