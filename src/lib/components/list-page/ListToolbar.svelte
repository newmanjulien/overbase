<script lang="ts">
	import CaretDown from 'phosphor-svelte/lib/CaretDown';
	import { cn } from '$lib/components/chrome/shared/cn';
	import { Button } from '$lib/components/ui';
	import ListActionButton from '$lib/components/list-page/ListActionButton.svelte';
	import ListSearchInput from '$lib/components/list-page/ListSearchInput.svelte';

	type Props = {
		searchPlaceholder?: string;
		searchAriaLabel?: string;
		filterLabel?: string;
		actionLabel?: string;
		onAction?: () => void;
		class?: string;
	};

	let {
		searchPlaceholder,
		searchAriaLabel,
		filterLabel,
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
			class="w-full md:flex-1"
		/>
	{/if}

	<div
		class={cn(
			'shrink-0 items-center gap-2 md:gap-2.5',
			searchPlaceholder ? 'hidden md:flex' : 'flex justify-end'
		)}
	>
		{#if filterLabel}
			<Button
				variant="secondary"
				class="min-w-0 flex-1 border-zinc-200/70 px-3 text-[0.72rem] font-normal text-zinc-950 md:flex-none md:text-[0.74rem]"
			>
				<span>{filterLabel}</span>
				{#snippet trailing()}
					<CaretDown aria-hidden="true" size={14} weight="regular" class="text-zinc-600" />
				{/snippet}
			</Button>
		{/if}

		{#if actionLabel}
			<ListActionButton label={actionLabel} class="flex-1 md:flex-none" onclick={onAction} />
		{/if}
	</div>
</div>
