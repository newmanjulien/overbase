<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { ClassValue } from 'clsx';
	import { Check, Plus, Search } from 'lucide-svelte';
	import AvatarStack from './AvatarStack.svelte';
	import { cn } from '$lib/components/chrome/shared/cn';
	import PersonAvatar from './PersonAvatar.svelte';

	type AvatarTeamPickerPerson = {
		id: string;
		name: string;
		avatar: string;
	};

	type Props = {
		id?: string;
		people: readonly AvatarTeamPickerPerson[];
		selectedIds: readonly string[];
		requiredSelectedIds?: readonly string[];
		onSelectedIdsChange: (nextIds: string[]) => void;
		size?: number;
		limit?: number;
		altBase?: string;
		ariaLabel?: string;
		searchLabel?: string;
		searchPlaceholder?: string;
		emptyLabel?: string;
		class?: ClassValue;
		avatarClass?: ClassValue;
	};

	const generatedId = $props.id();
	let {
		id = generatedId,
		people,
		selectedIds,
		requiredSelectedIds = [],
		onSelectedIdsChange,
		size = 28,
		limit = 3,
		altBase = 'Teammate',
		ariaLabel = 'Manage team members',
		searchLabel = 'Search people',
		searchPlaceholder = 'Search people...',
		emptyLabel = 'No people found',
		class: className = '',
		avatarClass
	}: Props = $props();

	let open = $state(false);
	let searchQuery = $state('');
	let triggerElement = $state<HTMLButtonElement | null>(null);
	let panelElement = $state<HTMLDivElement | null>(null);
	let searchInputElement = $state<HTMLInputElement | null>(null);
	let panelTop = $state(0);
	let panelLeft = $state(0);
	let panelWidth = $state(260);

	const pickerId = $derived(id);
	const requiredSelectedIdSet = $derived(new Set(requiredSelectedIds));
	const effectiveSelectedIds = $derived.by(() => {
		const nextIds = [...requiredSelectedIds];

		for (const selectedId of selectedIds) {
			if (!nextIds.includes(selectedId)) {
				nextIds.push(selectedId);
			}
		}

		return nextIds;
	});
	const selectedIdSet = $derived(new Set(effectiveSelectedIds));
	const selectedPeople = $derived(people.filter((person) => selectedIdSet.has(person.id)));
	const normalizedSearchQuery = $derived(searchQuery.trim().toLocaleLowerCase());
	const panelStyle = $derived(
		`top: ${panelTop}px; left: ${panelLeft}px; width: ${panelWidth}px;`
	);
	const visiblePeople = $derived.by(() => {
		return people
			.map((person, index) => ({ person, index }))
			.filter(({ person }) => person.name.toLocaleLowerCase().includes(normalizedSearchQuery))
			.sort((first, second) => {
				const firstSelected = selectedIdSet.has(first.person.id);
				const secondSelected = selectedIdSet.has(second.person.id);

				if (firstSelected !== secondSelected) {
					return firstSelected ? -1 : 1;
				}

				return first.index - second.index;
			})
			.map(({ person }) => person);
	});

	onMount(() => {
		document.addEventListener('scroll', updatePanelPosition, true);

		return () => {
			document.removeEventListener('scroll', updatePanelPosition, true);
		};
	});

	$effect(() => {
		if (open) {
			void handleOpen();
		} else {
			searchQuery = '';
		}
	});

	async function handleOpen() {
		await tick();
		updatePanelPosition();
		searchInputElement?.focus();
	}

	function togglePicker() {
		open = !open;
	}

	function closePicker({ restoreFocus = false } = {}) {
		if (!open) {
			return;
		}

		open = false;

		if (restoreFocus) {
			triggerElement?.focus();
		}
	}

	function shouldOpenAbove(triggerRect: DOMRect, panelHeight: number, gap: number, padding: number) {
		const topSpace = triggerRect.top - padding;
		const bottomSpace = window.innerHeight - triggerRect.bottom - padding;

		return bottomSpace < panelHeight + gap && topSpace > bottomSpace;
	}

	function updatePanelPosition() {
		if (!triggerElement || !open) {
			return;
		}

		const viewportPadding = 16;
		const triggerGap = 8;
		const nextPanelWidth = Math.min(260, window.innerWidth - viewportPadding * 2);
		const triggerRect = triggerElement.getBoundingClientRect();
		const panelHeight = panelElement?.getBoundingClientRect().height ?? 0;
		const preferredLeft = triggerRect.right - nextPanelWidth;
		const maxLeft = window.innerWidth - nextPanelWidth - viewportPadding;
		const opensAbove = shouldOpenAbove(triggerRect, panelHeight, triggerGap, viewportPadding);
		const preferredTop = opensAbove
			? triggerRect.top - panelHeight - triggerGap
			: triggerRect.bottom + triggerGap;
		const maxTop = window.innerHeight - panelHeight - viewportPadding;

		panelWidth = nextPanelWidth;
		panelLeft = Math.max(viewportPadding, Math.min(preferredLeft, maxLeft));
		panelTop = Math.max(viewportPadding, Math.min(preferredTop, maxTop));
	}

	function togglePerson(personId: string) {
		if (requiredSelectedIdSet.has(personId)) {
			return;
		}

		const nextSelectedIds = selectedIdSet.has(personId)
			? effectiveSelectedIds.filter((selectedId) => selectedId !== personId)
			: [...effectiveSelectedIds, personId];

		onSelectedIdsChange(nextSelectedIds);
	}

	function handleDocumentClick(event: MouseEvent) {
		if (!open) {
			return;
		}

		const target = event.target;

		if (!(target instanceof Node)) {
			return;
		}

		if (triggerElement?.contains(target) || panelElement?.contains(target)) {
			return;
		}

		closePicker();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !open) {
			return;
		}

		event.preventDefault();
		closePicker({ restoreFocus: true });
	}
</script>

<span class={cn('inline-flex items-center', className)}>
	<span class="inline-flex items-center -space-x-1">
		<AvatarStack people={selectedPeople} {size} {limit} {altBase} {avatarClass} />
		<button
			bind:this={triggerElement}
			type="button"
			aria-label={ariaLabel}
			aria-haspopup="dialog"
			aria-expanded={open}
			aria-controls={open ? pickerId : undefined}
			class="relative inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-dotted border-zinc-300 bg-white text-zinc-400 ring-1 ring-white transition-colors hover:bg-zinc-100 hover:text-zinc-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
			style={`width:${size}px;height:${size}px;`}
			onclick={togglePicker}
		>
			<Plus class="size-3" />
		</button>
	</span>

	{#if open}
		<div
			bind:this={panelElement}
			id={pickerId}
			role="dialog"
			aria-label={ariaLabel}
			class="fixed z-50 overflow-hidden rounded-sm border border-zinc-200 bg-white text-left shadow-lg shadow-zinc-950/5"
			style={panelStyle}
		>
			<label class="sr-only" for={`${pickerId}-search`}>{searchLabel}</label>
			<div class="relative border-b border-zinc-100">
				<Search
					aria-hidden="true"
					class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400"
				/>
				<input
					bind:this={searchInputElement}
					id={`${pickerId}-search`}
					type="search"
					bind:value={searchQuery}
					placeholder={searchPlaceholder}
					class="h-9 w-full border-0 bg-white pr-3 pl-8 text-[0.72rem] text-zinc-900 outline-none placeholder:text-zinc-400"
				/>
			</div>

			<div class="max-h-64 overflow-y-auto py-1">
				{#if visiblePeople.length > 0}
					{#each visiblePeople as person (person.id)}
						{@const isSelected = selectedIdSet.has(person.id)}
						{@const isRequired = requiredSelectedIdSet.has(person.id)}
						<button
							type="button"
							role="checkbox"
							aria-checked={isSelected}
							aria-disabled={isRequired}
							disabled={isRequired}
							class={cn(
								'flex h-9 w-full items-center gap-2 px-2.5 text-left transition-colors hover:bg-zinc-50 disabled:cursor-default disabled:hover:bg-white',
								isSelected ? 'text-zinc-950' : 'text-zinc-700'
							)}
							onclick={() => togglePerson(person.id)}
						>
							<PersonAvatar
								{person}
								size={22}
								class="border border-zinc-100"
								alt={`${person.name} avatar`}
							/>
							<span class="min-w-0 flex-1 truncate text-[0.72rem] font-normal">{person.name}</span>
							<span
								class={cn(
									'inline-flex size-4 shrink-0 items-center justify-center rounded-full border',
									isSelected
										? 'border-zinc-950 bg-zinc-950 text-white'
										: 'border-zinc-200 text-transparent'
								)}
								aria-hidden="true"
							>
								<Check class="size-2.5 stroke-[2.5]" />
							</span>
						</button>
					{/each}
				{:else}
					<p class="px-3 py-4 text-center text-[0.72rem] text-zinc-500">{emptyLabel}</p>
				{/if}
			</div>
		</div>
	{/if}
</span>

<svelte:document onclick={handleDocumentClick} onkeydown={handleKeydown} />
<svelte:window onresize={updatePanelPosition} />
