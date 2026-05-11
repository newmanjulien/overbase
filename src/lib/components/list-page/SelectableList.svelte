<script lang="ts">
	import { Check, Ellipsis, Minus, Trash2 } from 'lucide-svelte';
	import { cn } from '$lib/components/chrome/shared/cn';
	import PersonAvatar from '$lib/components/chrome/shared/PersonAvatar.svelte';
	import { IconButton } from '$lib/components/ui';
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

	$effect(() => {
		function closeActionsMenu(event: MouseEvent) {
			if (
				event.target instanceof Element &&
				event.target.closest('[data-selectable-list-actions]')
			) {
				return;
			}

			openActionsItemId = null;
			selectedActionsOpen = false;
		}

		document.addEventListener('click', closeActionsMenu);

		return () => {
			document.removeEventListener('click', closeActionsMenu);
		};
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

	function toggleActionsMenu(id: string) {
		openActionsItemId = openActionsItemId === id ? null : id;
		selectedActionsOpen = false;
	}

	function toggleSelectedActionsMenu() {
		if (selectedItemIds.length === 0 || selectedActions.length === 0) {
			return;
		}

		selectedActionsOpen = !selectedActionsOpen;
		openActionsItemId = null;
	}

	async function selectAction(action: SelectableListItemAction) {
		if (action.disabled) {
			return;
		}

		openActionsItemId = null;
		await action.onSelect();
	}

	async function selectSelectedAction(action: SelectableListSelectedAction) {
		if (action.disabled || selectedItemIds.length === 0) {
			return;
		}

		selectedActionsOpen = false;
		await action.onSelect(selectedItemIds);
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
					class="relative h-12 py-2.5 pr-4 pl-4 text-right align-middle md:pr-5"
					data-selectable-list-actions
				>
					<IconButton
						variant="ghost"
						aria-label={selectedActionsAriaLabel}
						disabled={selectedItemIds.length === 0 || selectedActions.length === 0}
						onclick={toggleSelectedActionsMenu}
						class="size-7 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
					>
						<Ellipsis aria-hidden="true" class="size-3" />
					</IconButton>
					{#if selectedActionsOpen}
						<div
							class="absolute top-11 right-4 z-20 min-w-32 overflow-hidden rounded-sm border border-zinc-200 bg-white py-1 text-left shadow-lg shadow-zinc-950/5 md:right-5"
						>
							{#each selectedActions as action}
								<button
									type="button"
									class={cn(
										'flex h-8 w-full items-center gap-2 px-2.5 text-left text-[0.72rem] font-normal transition-colors disabled:cursor-default disabled:opacity-50',
										action.intent === 'destructive'
											? 'text-red-700 hover:bg-red-50'
											: 'text-zinc-700 hover:bg-zinc-50'
									)}
									aria-label={action.ariaLabel ?? action.label}
									disabled={action.disabled}
									onclick={() => selectSelectedAction(action)}
								>
									{#if action.intent === 'destructive'}
										<Trash2 aria-hidden="true" class="size-3.5" />
									{/if}
									<span class="truncate">{action.label}</span>
								</button>
							{/each}
						</div>
					{/if}
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
						class="relative h-14 py-2.5 pr-4 pl-4 text-right align-middle md:pr-5"
						data-selectable-list-actions
					>
						<IconButton
							variant="ghost"
							aria-label={item.actionsAriaLabel ?? rowActionsAriaLabel}
							disabled={!item.actions?.length}
							onclick={() => toggleActionsMenu(item.id)}
							class="size-7 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
						>
							<Ellipsis aria-hidden="true" class="size-3" />
						</IconButton>
						{#if openActionsItemId === item.id && item.actions?.length}
							<div
								class="absolute top-11 right-4 z-20 min-w-32 overflow-hidden rounded-sm border border-zinc-200 bg-white py-1 text-left shadow-lg shadow-zinc-950/5 md:right-5"
							>
								{#each item.actions as action}
									<button
										type="button"
										class={cn(
											'flex h-8 w-full items-center gap-2 px-2.5 text-left text-[0.72rem] font-normal transition-colors disabled:cursor-default disabled:opacity-50',
											action.intent === 'destructive'
												? 'text-red-700 hover:bg-red-50'
												: 'text-zinc-700 hover:bg-zinc-50'
										)}
										aria-label={action.ariaLabel ?? action.label}
										disabled={action.disabled}
										onclick={() => selectAction(action)}
									>
										{#if action.intent === 'destructive'}
											<Trash2 aria-hidden="true" class="size-3.5" />
										{/if}
										<span class="truncate">{action.label}</span>
									</button>
								{/each}
							</div>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
