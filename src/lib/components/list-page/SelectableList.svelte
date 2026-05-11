<script lang="ts">
	import { Check, Minus } from 'lucide-svelte';
	import { cn } from '$lib/components/chrome/shared/cn';
	import PersonAvatar from '$lib/components/chrome/shared/PersonAvatar.svelte';
	import { FloatingActionMenu, type FloatingActionMenuAction } from '$lib/components/ui';
	import type {
		SelectableListItem,
		SelectableListItemAction,
		SelectableListSelectedAction
	} from '$lib/components/list-page/types';

	type Props = {
		items: SelectableListItem[];
		selectAllLabel?: string;
		selectAllAriaLabel?: string;
		selectedActionsAriaLabel?: string;
		selectedActions?: SelectableListSelectedAction[];
		rowActionsAriaLabel?: string;
	};

	let {
		items,
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
			disabled: action.disabled || selectedItemIds.length === 0,
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
</script>

<div class="bg-white">
	<table class="w-full table-auto border-collapse">
		<colgroup>
			<col class="w-full" />
			<col class="hidden sm:table-column" />
			<col class="w-9" />
			<col class="w-7" />
		</colgroup>
		<thead class="border-b border-zinc-200/70 bg-zinc-50">
			<tr>
				<th
					colspan="3"
					scope="colgroup"
					class="h-12 py-2.5 pr-0 pl-4 text-left align-middle font-normal md:pl-5"
				>
					<label class="flex min-w-0 items-center gap-3.5 text-[0.7rem] font-normal text-zinc-700">
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
								<Check class="size-2.5 stroke-[2.5]" />
							{:else if someSelected}
								<Minus class="size-2.5 stroke-[2.5]" />
							{/if}
						</span>
						<span class="truncate">{selectAllLabel}</span>
					</label>
				</th>
				<th
					scope="col"
					class="h-12 py-2.5 pr-4 pl-4 text-right align-middle md:pr-5"
				>
					<FloatingActionMenu
						id="selectable-list-selected-actions"
						ariaLabel={selectedActionsAriaLabel}
						disabled={selectedItemIds.length === 0 || selectedActions.length === 0}
						actions={toSelectedActionMenuActions()}
						bind:open={selectedActionsOpen}
						onOpenChange={setSelectedActionsOpen}
					/>
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-zinc-200/70 bg-white">
			{#each items as item (item.id)}
				<tr class="transition-colors hover:bg-zinc-50">
					<th
						scope="row"
						class="h-14 min-w-0 py-2.5 pr-0 pl-4 text-left align-middle font-normal md:pl-5"
					>
						<label class="flex min-w-0 items-center gap-3.5">
							<input
								type="checkbox"
								class="peer sr-only"
								checked={isSelected(item.id)}
								aria-label={item.selectAriaLabel ?? `Select ${item.title}`}
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
									<Check class="size-2.5 stroke-[2.5]" />
								{/if}
							</span>
							<span class="flex min-w-0 flex-col gap-0.5">
								<span class="truncate text-[0.7rem] text-zinc-950">
									{item.title}
								</span>
								{#if item.descriptionLabel}
									<span class="truncate text-[0.72rem] text-zinc-400">
										{item.descriptionLabel}
									</span>
								{/if}
							</span>
						</label>
					</th>

					<td class="hidden h-14 whitespace-nowrap py-2.5 pr-0 pl-4 align-middle text-[0.72rem] text-zinc-400 sm:table-cell">
						{#if item.metaLabel}
							{item.metaLabel}
						{/if}
					</td>

					<td class="h-14 py-2.5 pr-0 pl-4 align-middle">
						{#if item.creator}
							<PersonAvatar
								person={item.creator}
								size={22}
								class="ring-1 ring-zinc-200/70"
							/>
						{:else}
							<span aria-hidden="true" class="block size-5.5"></span>
						{/if}
					</td>

					<td
						class="h-14 py-2.5 pr-4 pl-4 text-right align-middle md:pr-5"
					>
						<FloatingActionMenu
							id={`selectable-list-${item.id}-actions`}
							ariaLabel={item.actionsAriaLabel ?? rowActionsAriaLabel}
							disabled={!item.actions?.length}
							actions={toRowActionMenuActions(item.actions)}
							open={openActionsItemId === item.id}
							onOpenChange={(open) => setRowActionsOpen(item.id, open)}
						/>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
