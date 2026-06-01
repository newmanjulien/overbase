<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		createFormatsGalleryHref,
		normalizeCreateFormatsModeFilter,
		type CreateFormatsModeFilterId
	} from '$lib/app/app-links';
	import { InfoBar } from '$lib/ui';
	import { ListContentState, ListPage, ListToolbar } from '$lib/patterns/list-page';
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
			infoText: 'These are emails your team receives, not your clients'
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

	{#if formatStarters.length === 0}
		<ListContentState kind="empty" message="No formats available." class="rounded-sm border" />
	{:else if filteredFormatStarters.length === 0}
		<ListContentState kind="empty" message="No matching formats." class="rounded-sm border" />
	{:else}
		<div class="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredFormatStarters as formatStarter (formatStarter.slug)}
				<FormatStarterCard {formatStarter} />
			{/each}
		</div>
	{/if}

	{#snippet footer()}
		<InfoBar label={selectedModeFilterContent.infoLabel}>
			{selectedModeFilterContent.infoText}
		</InfoBar>
	{/snippet}
</ListPage>
