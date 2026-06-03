<script lang="ts">
	import { page } from '$app/state';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import { useCurrentWorkspaceContext } from '$lib/app/current-workspace.svelte';
	import { InfoBar } from '$lib/ui';
	import {
		ListContentState,
		ListPage,
		ListNoResultsState,
		type EmptyListStateConfig,
		type NoResultsListStateConfig
	} from '$lib/patterns/list-page';
	import type { FormatStarterGalleryEntry } from '$lib/features/format-starters/catalog';
	import {
		getCreateFormatGalleryCategoryFromSearchParams,
		matchesCreateFormatGalleryCategory
	} from './create-format-gallery-categories';
	import FormatStarterCard from './FormatStarterCard.svelte';

	type Props = {
		formatStarters: readonly FormatStarterGalleryEntry[];
	};

	let { formatStarters }: Props = $props();
	const currentWorkspace = useCurrentWorkspaceContext();
	const selectedCategory = $derived(
		getCreateFormatGalleryCategoryFromSearchParams(
			page.url.searchParams,
			currentWorkspace.user.lastCreateFormatGalleryCategoryId
		)
	);
	const filteredFormatStarters = $derived(formatStarters.filter(matchesFormatStarterFilters));
	const totalRecords = $derived(formatStarters.length);
	const visibleRecords = $derived(filteredFormatStarters.length);
	const emptyListState = {
		icon: APP_ROUTE_REGISTRY['create-formats'].icon,
		title: 'No formats available',
		description: 'Create a format from one of the available starting points.'
	} satisfies EmptyListStateConfig;
	const noResultsState = {
		title: 'No matching formats',
		description: 'Try a different category.'
	} satisfies NoResultsListStateConfig;

	function matchesFormatStarterFilters(formatStarter: FormatStarterGalleryEntry) {
		return matchesCreateFormatGalleryCategory(formatStarter, selectedCategory);
	}
</script>

<ListPage contentClass="border-0 bg-transparent">
	{#if totalRecords === 0}
		<ListContentState kind="empty" message="No formats available." class="rounded-sm border" />
	{:else if visibleRecords === 0}
		<ListNoResultsState
			empty={emptyListState}
			{...noResultsState}
			class="rounded-sm border border-stone-200/70 bg-white"
		/>
	{:else}
		<div class="format-starter-gallery grid grid-cols-1 gap-x-2.5 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
			{#each filteredFormatStarters as formatStarter (formatStarter.slug)}
				<FormatStarterCard {formatStarter} />
			{/each}
		</div>
	{/if}

	{#snippet footer()}
		{#if totalRecords > 0}
			<InfoBar label={selectedCategory.infoBar.label}>
				{selectedCategory.infoBar.text}
			</InfoBar>
		{/if}
	{/snippet}
</ListPage>

<style>
	:global(.format-starter-gallery .format-starter-card) {
		padding-block: calc(0.375rem + 1px);
	}

	:global(.format-starter-gallery .starter-artwork-card) {
		aspect-ratio: 2.2;
	}
</style>
