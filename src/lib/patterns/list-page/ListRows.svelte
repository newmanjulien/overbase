<script lang="ts" generics="Item extends ListRowItem">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { FloatingActionMenu } from '$lib/ui';
	import { cn } from '$lib/ui/cn';
	import type { ListRowItem } from '$lib/patterns/list-page/types';

	type Props = {
		items: Item[];
		rowCells: Snippet<[Item]>;
		rowActionsAriaLabel?: string;
	};

	let {
		items,
		rowCells,
		rowActionsAriaLabel = 'Item actions'
	}: Props = $props();

	let openActionsItemId = $state<string | null>(null);

	function hasRowActions(item: Item) {
		return Boolean(item.actions?.length);
	}

	function setRowActionsOpen(itemId: string, open: boolean) {
		openActionsItemId = open ? itemId : null;
	}

	function handleRowClick(item: Item, event: MouseEvent) {
		if (!item.href) {
			return;
		}

		const target = event.target;

		if (target instanceof Element && target.closest('a, button, input, label')) {
			return;
		}

		void goto(resolve(item.href));
	}

	function rowClass(item: Item) {
		return cn(
			'grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3.5 px-4 py-2.5 md:px-5',
			item.href && 'cursor-pointer'
		);
	}
</script>

<div class="bg-white">
	<div role="list" class="divide-y divide-stone-200/70 bg-white">
		{#each items as item (item.id)}
			<!-- The nested content owns the real link; this preserves pointer row-click without making the row a fake interactive parent around menu controls. -->
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<div
				role="listitem"
				class={rowClass(item)}
				onclick={item.href ? (event) => handleRowClick(item, event) : undefined}
			>
				<div class={cn('min-w-0', !hasRowActions(item) && 'col-span-2')}>
					{@render rowCells(item)}
				</div>

				{#if hasRowActions(item)}
					<div class="flex h-9 items-center justify-self-end">
						<FloatingActionMenu
							id={`list-rows-${item.id}-actions`}
							ariaLabel={item.actionsAriaLabel ?? rowActionsAriaLabel}
							actions={item.actions ?? []}
							open={openActionsItemId === item.id}
							onOpenChange={(open) => setRowActionsOpen(item.id, open)}
						/>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
