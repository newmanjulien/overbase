<script lang="ts">
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
		type ListFilterConfig,
		type NoResultsListStateConfig
	} from '$lib/patterns/list-page';
	import {
		FORMAT_STARTER_INDUSTRY_TAGS,
		isFormatStarterIndustryTagId,
		type FormatStarterGalleryEntry,
		type FormatStarterIndustryTagId
	} from '$lib/features/format-starters/catalog';
	import FormatStarterCard from './FormatStarterCard.svelte';

	type CreateFormatsIndustryFilterId = 'all' | FormatStarterIndustryTagId;

	type CreateFormatsDataTypeFilterOption = {
		id: CreateFormatsModeFilterId;
		label: string;
		infoLabel: string;
		infoText: string;
	};

	type CreateFormatsIndustryFilterOption = {
		id: CreateFormatsIndustryFilterId;
		label: string;
	};

	type Props = {
		formatStarters: readonly FormatStarterGalleryEntry[];
	};

	let { formatStarters }: Props = $props();
	let searchQuery = $state('');
	const selectedModeFilter = $derived(
		normalizeCreateFormatsModeFilter(page.url.searchParams.get('mode'))
	);
	const selectedIndustryFilter = $derived(
		normalizeCreateFormatsIndustryFilter(page.url.searchParams.get('industry'))
	);
	const currentGalleryHref = $derived(`${page.url.pathname}${page.url.search}`);

	const dataTypeFilterOptions = [
		{
			id: 'all',
			label: 'All data types',
			infoLabel: 'Tip:',
			infoText: "You're creating the format of emails your team will receive, not clients"
		},
		{
			id: 'internal-data',
			label: 'Internal data',
			infoLabel: 'Internal data:',
			infoText: 'These formats use data which you and your ecosystem partners connect'
		},
		{
			id: 'public-data',
			label: 'Public data',
			infoLabel: 'Public data:',
			infoText: "These formats use public data and don't use any of your internal data"
		}
	] satisfies readonly CreateFormatsDataTypeFilterOption[];
	const industryFilterOptions = [
		{ id: 'all', label: 'All industries' },
		...FORMAT_STARTER_INDUSTRY_TAGS
	] satisfies readonly CreateFormatsIndustryFilterOption[];
	const selectedDataTypeFilterOption = $derived(
		dataTypeFilterOptions.find((option) => option.id === selectedModeFilter) ??
			dataTypeFilterOptions[0]
	);
	const selectedIndustryFilterOption = $derived(
		industryFilterOptions.find((option) => option.id === selectedIndustryFilter) ??
			industryFilterOptions[0]
	);
	const galleryFilters = $derived([
		{
			id: 'industry',
			label: selectedIndustryFilterOption.label,
			selectedId: selectedIndustryFilter,
			options: industryFilterOptions,
			onSelect: setSelectedIndustryFilter
		},
		{
			id: 'data-type',
			label: selectedDataTypeFilterOption.label,
			selectedId: selectedModeFilter,
			options: dataTypeFilterOptions,
			onSelect: setSelectedModeFilter
		}
	] satisfies readonly ListFilterConfig[]);
	const filteredFormatStarters = $derived(formatStarters.filter(matchesFormatStarterFilters));
	const totalRecords = $derived(formatStarters.length);
	const visibleRecords = $derived(filteredFormatStarters.length);
	const isQueryActive = $derived(
		Boolean(searchQuery.trim()) || selectedModeFilter !== 'all' || selectedIndustryFilter !== 'all'
	);
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

		const href = createFormatsGalleryHref({
			mode: optionId,
			industry: selectedIndustryFilter
		});

		updateGalleryHref(href);
	}

	function setSelectedIndustryFilter(optionId: string) {
		if (!isFormatStarterIndustryFilterId(optionId)) {
			return;
		}

		const href = createFormatsGalleryHref({
			mode: selectedModeFilter,
			industry: optionId
		});

		updateGalleryHref(href);
	}

	function updateGalleryHref(href: string) {
		if (href === currentGalleryHref) {
			return;
		}

		void goto(href, {
			keepFocus: true,
			noScroll: true
		});
	}

	function isFormatStarterDataModeFilterId(optionId: string): optionId is CreateFormatsModeFilterId {
		return dataTypeFilterOptions.some((option) => option.id === optionId);
	}

	function isFormatStarterIndustryFilterId(
		optionId: string
	): optionId is CreateFormatsIndustryFilterId {
		return optionId === 'all' || isFormatStarterIndustryTagId(optionId);
	}

	function normalizeCreateFormatsIndustryFilter(
		value: string | null | undefined
	): CreateFormatsIndustryFilterId {
		return value && isFormatStarterIndustryTagId(value) ? value : 'all';
	}

	function matchesIndustryFilter(formatStarter: FormatStarterGalleryEntry) {
		return (
			selectedIndustryFilter === 'all' ||
			formatStarter.industryTags.length === 0 ||
			formatStarter.industryTags.includes(selectedIndustryFilter)
		);
	}

	function matchesFormatStarterFilters(formatStarter: FormatStarterGalleryEntry) {
		const normalizedQuery = normalizeSearchText(searchQuery);

		return (
			(selectedModeFilter === 'all' || formatStarter.mode === selectedModeFilter) &&
			matchesIndustryFilter(formatStarter) &&
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
			filters={galleryFilters}
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
			<InfoBar label={selectedDataTypeFilterOption.infoLabel}>
				{selectedDataTypeFilterOption.infoText}
			</InfoBar>
		{/if}
	{/snippet}
</ListPage>
