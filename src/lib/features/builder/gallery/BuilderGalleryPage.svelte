<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		buildFormatsGalleryHref,
		normalizeBuildFormatsModeFilter,
		type BuildFormatsModeFilterId
	} from '$lib/app/app-links';
	import { InfoBar } from '$lib/ui';
	import { ListContentState, ListPage, ListToolbar } from '$lib/patterns/list-page';
	import type { BuilderGalleryEntry } from '$lib/features/builder/catalog';
	import BuilderCard from './BuilderCard.svelte';

	type Props = {
		builders: readonly BuilderGalleryEntry[];
	};

	let { builders }: Props = $props();
	let searchQuery = $state('');
	const selectedModeFilter = $derived(
		normalizeBuildFormatsModeFilter(page.url.searchParams.get('mode'))
	);
	const currentGalleryHref = $derived(`${page.url.pathname}${page.url.search}`);

	const modeFilterContent = {
		all: {
			label: 'All builders',
			infoLabel: 'Tip:',
			infoText: 'These are emails your team receives, not your clients'
		},
		'internal-data': {
			label: 'Internal data',
			infoLabel: 'Internal data:',
			infoText: 'These formats use data which you and your ecosystem connect'
		},
		'public-data': {
			label: 'Public data',
			infoLabel: 'Public data:',
			infoText: "These formats use public data and don't use any of your internal data"
		}
	} satisfies Record<
		BuildFormatsModeFilterId,
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
	const filteredBuilders = $derived(builders.filter(matchesBuilderFilters));

	function normalizeSearchText(value: string) {
		return value.trim().toLowerCase();
	}

	function setSelectedModeFilter(optionId: string) {
		if (!isBuilderModeFilterId(optionId)) {
			return;
		}

		const href = buildFormatsGalleryHref(optionId);

		if (href === currentGalleryHref) {
			return;
		}

		void goto(resolve(href), {
			keepFocus: true,
			noScroll: true
		});
	}

	function isBuilderModeFilterId(optionId: string): optionId is BuildFormatsModeFilterId {
		return optionId in modeFilterContent;
	}

	function matchesBuilderFilters(builder: BuilderGalleryEntry) {
		const normalizedQuery = normalizeSearchText(searchQuery);

		return (
			(selectedModeFilter === 'all' || builder.mode === selectedModeFilter) &&
			(!normalizedQuery ||
				[builder.title, builder.description].some((value) =>
					value.toLowerCase().includes(normalizedQuery)
				))
		);
	}
</script>

<ListPage contentClass="border-0 bg-transparent">
	{#snippet toolbar()}
		<ListToolbar
			searchPlaceholder="Search builders..."
			searchAriaLabel="Search builders"
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

	{#if builders.length === 0}
		<ListContentState kind="empty" message="No formats available." class="rounded-sm border" />
	{:else if filteredBuilders.length === 0}
		<ListContentState kind="empty" message="No matching builders." class="rounded-sm border" />
	{:else}
		<div class="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredBuilders as builder (builder.slug)}
				<BuilderCard {builder} />
			{/each}
		</div>
	{/if}

	{#snippet footer()}
		<InfoBar label={selectedModeFilterContent.infoLabel}>
			{selectedModeFilterContent.infoText}
		</InfoBar>
	{/snippet}
</ListPage>
