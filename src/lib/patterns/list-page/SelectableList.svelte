<script lang="ts" generics="Item extends SelectableListItem">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import MinusIcon from 'phosphor-svelte/lib/MinusIcon';
	import { cn } from '$lib/ui/cn';
	import { FloatingActionMenu, type FloatingActionMenuAction } from '$lib/ui';
	import type {
		SelectableListItem,
		SelectableListSelectedAction
	} from '$lib/patterns/list-page/types';

	type Props = {
		items: Item[];
		rowCells: Snippet<[Item]>;
		selectAllLabel?: string;
		selectAllAriaLabel?: string;
		selectedActionsAriaLabel?: string;
		selectedActions?: SelectableListSelectedAction[];
		rowActionsAriaLabel?: string;
	};

	let {
		items,
		rowCells,
		selectAllLabel = 'Select all',
		selectAllAriaLabel = 'Select all items',
		selectedActionsAriaLabel = 'Selected item actions',
		selectedActions = [],
		rowActionsAriaLabel = 'Item actions'
	}: Props = $props();

	let selectedItemIds = $state<string[]>([]);
	let selectAllCheckbox = $state<HTMLInputElement | null>(null);
	let openActionsItemId = $state<string | null>(null);
	let selectedActionsOpen = $state(false);

	const itemIds = $derived(items.map((item) => item.id));
	const itemIdSet = $derived(new Set(itemIds));
	const selectedItemIdSet = $derived(new Set(selectedItemIds));
	const allSelected = $derived(items.length > 0 && selectedItemIds.length === items.length);
	const someSelected = $derived(selectedItemIds.length > 0 && !allSelected);

	$effect(() => {
		if (selectAllCheckbox) {
			selectAllCheckbox.indeterminate = someSelected;
		}
	});

	$effect(() => {
		const validSelectedItemIds = selectedItemIds.filter((id) => itemIdSet.has(id));

		if (validSelectedItemIds.length !== selectedItemIds.length) {
			selectedItemIds = validSelectedItemIds;
		}
	});

	function isSelected(id: string) {
		return selectedItemIdSet.has(id);
	}

	function toggleItem(id: string) {
		selectedItemIds = isSelected(id)
			? selectedItemIds.filter((selectedId) => selectedId !== id)
			: [...selectedItemIds, id];
	}

	function toggleAllItems() {
		selectedItemIds = allSelected ? [] : itemIds;
	}

	function toSelectedActionMenuActions(): FloatingActionMenuAction[] {
		return selectedActions.map((action: SelectableListSelectedAction) => ({
			label: action.label,
			ariaLabel: action.ariaLabel,
			intent: action.intent,
			disabled:
				selectedItemIds.length === 0 ||
				(typeof action.disabled === 'function'
					? action.disabled(selectedItemIds)
					: action.disabled),
			onSelect: () => action.onSelect(selectedItemIds)
		}));
	}

	function hasRowActions(item: Item) {
		return Boolean(item.actions?.length);
	}

	function setSelectedActionsOpen(open: boolean) {
		selectedActionsOpen = open;

		if (open) {
			openActionsItemId = null;
		}
	}

	function setRowActionsOpen(itemId: string, open: boolean) {
		openActionsItemId = open ? itemId : null;

		if (open) {
			selectedActionsOpen = false;
		}
	}

	function handleRowClick(item: Item, event: MouseEvent) {
		if (!item.href) {
			return;
		}

		const target = event.target;

		if (target instanceof Element && target.closest('a, button, input, label')) {
			return;
		}

		void goto(resolve(item.href as '/'));
	}

	function rowClass(item: Item) {
		return cn(
			'grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3.5 px-4 py-2.5 md:px-5',
			item.href && 'cursor-pointer'
		);
	}
</script>

{#snippet itemCells(item: Item)}
	<label class="flex h-9 w-3.5 shrink-0 items-center">
		<input
			type="checkbox"
			class="peer sr-only"
			checked={isSelected(item.id)}
			aria-label={item.selectAriaLabel ?? 'Select item'}
			onchange={() => toggleItem(item.id)}
		/>
		<span
			class={cn(
				'flex size-3.5 shrink-0 items-center justify-center rounded border border-zinc-300/70 bg-white text-white transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-300',
				isSelected(item.id) && 'border-zinc-950 bg-zinc-950'
			)}
			aria-hidden="true"
		>
			{#if isSelected(item.id)}
				<CheckIcon size={10} weight="bold" />
			{/if}
		</span>
	</label>

	<div class={cn('min-w-0', !hasRowActions(item) && 'col-span-2')}>
		{@render rowCells(item)}
	</div>

	{#if hasRowActions(item)}
		<div class="flex h-9 items-center justify-self-end">
			<FloatingActionMenu
				id={`selectable-list-${item.id}-actions`}
				ariaLabel={item.actionsAriaLabel ?? rowActionsAriaLabel}
				actions={item.actions ?? []}
				open={openActionsItemId === item.id}
				onOpenChange={(open) => setRowActionsOpen(item.id, open)}
			/>
		</div>
	{/if}
{/snippet}

<div class="bg-white">
	<div class="border-b border-zinc-200/70 bg-zinc-50">
		<div
			class="grid min-h-12 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 py-2.5 pr-4 pl-4 md:pr-5 md:pl-5"
		>
			<label class="col-span-2 flex min-w-0 items-center gap-3.5 text-[0.7rem] font-normal text-zinc-700">
				<input
					bind:this={selectAllCheckbox}
					type="checkbox"
					class="peer sr-only"
					checked={allSelected}
					aria-label={selectAllAriaLabel}
					onchange={toggleAllItems}
				/>
				<span
					class={cn(
						'flex size-3.5 shrink-0 items-center justify-center rounded border border-zinc-300/70 bg-white text-white transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-300',
						(allSelected || someSelected) && 'border-zinc-950 bg-zinc-950'
					)}
					aria-hidden="true"
				>
					{#if allSelected}
						<CheckIcon size={10} weight="bold" />
					{:else if someSelected}
						<MinusIcon size={10} weight="bold" />
					{/if}
				</span>
				<span class="truncate">{selectAllLabel}</span>
			</label>

			<div class="justify-self-end">
				<FloatingActionMenu
					id="selectable-list-selected-actions"
					ariaLabel={selectedActionsAriaLabel}
					disabled={selectedItemIds.length === 0 || selectedActions.length === 0}
					actions={toSelectedActionMenuActions()}
					bind:open={selectedActionsOpen}
					onOpenChange={setSelectedActionsOpen}
				/>
			</div>
		</div>
	</div>

	<div role="list" class="divide-y divide-zinc-200/70 bg-white">
		{#each items as item (item.id)}
			<!-- The nested content owns the real link; this preserves pointer row-click without making the row a fake interactive parent around checkbox/menu controls. -->
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<div
				role="listitem"
				class={rowClass(item)}
				onclick={item.href ? (event) => handleRowClick(item, event) : undefined}
			>
				{@render itemCells(item)}
			</div>
		{/each}
	</div>
</div>
