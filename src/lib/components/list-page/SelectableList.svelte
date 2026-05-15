<script lang="ts" generics="Item extends SelectableListItem">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import Check from 'phosphor-svelte/lib/Check';
	import Minus from 'phosphor-svelte/lib/Minus';
	import { cn } from '$lib/components/chrome/shared/cn';
	import { FloatingActionMenu, type FloatingActionMenuAction } from '$lib/components/ui';
	import type {
		SelectableListItem,
		SelectableListItemAction,
		SelectableListSelectedAction
	} from '$lib/components/list-page/types';

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

	function toRowActionMenuActions(actions: SelectableListItemAction[] = []): FloatingActionMenuAction[] {
		return actions.map((action) => ({
			label: action.label,
			ariaLabel: action.ariaLabel,
			intent: action.intent,
			disabled: action.disabled,
			onSelect: action.onSelect
		}));
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
</script>

{#snippet itemCells(item: Item)}
	<label class="flex size-3.5 shrink-0 items-center">
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
				<Check size={10} weight="bold" />
			{/if}
		</span>
	</label>

	<div class="min-w-0">
		{@render rowCells(item)}
	</div>

	<div class="justify-self-end">
		<FloatingActionMenu
			id={`selectable-list-${item.id}-actions`}
			ariaLabel={item.actionsAriaLabel ?? rowActionsAriaLabel}
			disabled={!item.actions?.length}
			actions={toRowActionMenuActions(item.actions)}
			open={openActionsItemId === item.id}
			onOpenChange={(open) => setRowActionsOpen(item.id, open)}
		/>
	</div>
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
						<Check size={10} weight="bold" />
					{:else if someSelected}
						<Minus size={10} weight="bold" />
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
			{#if item.href}
				<!-- The nested content owns the real link; this preserves pointer row-click without making the row a fake interactive parent around checkbox/menu controls. -->
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
				<div
					role="listitem"
					class="grid min-h-14 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 px-4 py-2.5 md:px-5"
					onclick={(event) => handleRowClick(item, event)}
				>
					{@render itemCells(item)}
				</div>
			{:else}
				<div
					role="listitem"
					class="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 px-4 py-2.5 md:px-5"
				>
					{@render itemCells(item)}
				</div>
			{/if}
		{/each}
	</div>
</div>
