<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		createFormatsGalleryHref,
		normalizeCreateFormatsModeFilter,
		type CreateFormatsModeFilterId
	} from '$lib/app/app-links';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import { InfoBar } from '$lib/ui';
	import {
		ListContentState,
		ListPage,
		ListToolbar,
		ListNoResultsState,
		type EmptyListStateConfig,
		type NoResultsListStateConfig
	} from '$lib/patterns/list-page';
	import type { FormatStarterGalleryEntry } from '$lib/features/format-starters/catalog';
	import FormatStarterCard from './FormatStarterCard.svelte';

	type Props = {
		formatStarters: readonly FormatStarterGalleryEntry[];
	};

	let { formatStarters }: Props = $props();
	let searchQuery = $state('');
	const selectedModeFilter = $derived(
		normalizeCreateFormatsModeFilter(page.url.searchParams.get('mode'))
	);
	const currentGalleryHref = $derived(`${page.url.pathname}${page.url.search}`);

	const modeFilterContent = {
		all: {
			label: 'All formats',
			infoLabel: 'Tip:',
			infoText: "You're creating emails that your team will receive, not clients"
		},
		'internal-data': {
			label: 'Internal data',
			infoLabel: 'Internal data:',
			infoText: 'These formats use data which you and your ecosystem partners connect'
		},
		'public-data': {
			label: 'Public data',
			infoLabel: 'Public data:',
			infoText: "These formats use public data and don't use any of your internal data"
		}
	} satisfies Record<
		CreateFormatsModeFilterId,
		{
			label: string;
			infoLabel: string;
			infoText: string;
		}
	>;
	const modeFilterOptions = Object.entries(modeFilterContent).map(([id, content]) => ({
		id,
		label: content.label
	}));
	const selectedModeFilterContent = $derived(modeFilterContent[selectedModeFilter]);
	const filteredFormatStarters = $derived(formatStarters.filter(matchesFormatStarterFilters));
	const totalRecords = $derived(formatStarters.length);
	const visibleRecords = $derived(filteredFormatStarters.length);
	const isQueryActive = $derived(Boolean(searchQuery.trim()) || selectedModeFilter !== 'all');
	const emptyListState = {
		icon: APP_ROUTE_REGISTRY['create-formats'].icon,
		title: 'No formats available',
		description: 'Create a format from one of the available starting points.'
	} satisfies EmptyListStateConfig;
	const noResultsState = {
		title: 'No matching formats',
		description: 'Try a different search term or starter name'
	} satisfies NoResultsListStateConfig;

	function normalizeSearchText(value: string) {
		return value.trim().toLowerCase();
	}

	function setSelectedModeFilter(optionId: string) {
		if (!isFormatStarterDataModeFilterId(optionId)) {
			return;
		}

		const href = createFormatsGalleryHref(optionId);

		if (href === currentGalleryHref) {
			return;
		}

		void goto(resolve(href), {
			keepFocus: true,
			noScroll: true
		});
	}

	function isFormatStarterDataModeFilterId(optionId: string): optionId is CreateFormatsModeFilterId {
		return optionId in modeFilterContent;
	}

	function matchesFormatStarterFilters(formatStarter: FormatStarterGalleryEntry) {
		const normalizedQuery = normalizeSearchText(searchQuery);

		return (
			(selectedModeFilter === 'all' || formatStarter.mode === selectedModeFilter) &&
			(!normalizedQuery ||
				[formatStarter.title, formatStarter.description].some((value) =>
					value.toLowerCase().includes(normalizedQuery)
				))
		);
	}
</script>

<ListPage contentClass="border-0 bg-transparent">
	{#snippet toolbar()}
		<ListToolbar
			searchPlaceholder="Search formats..."
			searchAriaLabel="Search formats"
			searchValue={searchQuery}
			onSearchValueChange={(value) => (searchQuery = value)}
			filter={{
				label: selectedModeFilterContent.label,
				selectedId: selectedModeFilter,
				options: modeFilterOptions,
				onSelect: setSelectedModeFilter
			}}
		/>
	{/snippet}

	{#if totalRecords === 0 && isQueryActive}
		<ListNoResultsState
			empty={emptyListState}
			{...noResultsState}
			class="rounded-sm border border-stone-200/70 bg-white"
		/>
	{:else if totalRecords === 0}
		<ListContentState kind="empty" message="No formats available." class="rounded-sm border" />
	{:else if visibleRecords === 0}
		<ListNoResultsState
			empty={emptyListState}
			{...noResultsState}
			class="rounded-sm border border-stone-200/70 bg-white"
		/>
	{:else}
		<div class="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredFormatStarters as formatStarter (formatStarter.slug)}
				<FormatStarterCard {formatStarter} />
			{/each}
		</div>
	{/if}

	{#snippet footer()}
		{#if totalRecords > 0}
			<InfoBar label={selectedModeFilterContent.infoLabel}>
				{selectedModeFilterContent.infoText}
			</InfoBar>
		{/if}
	{/snippet}
</ListPage>
