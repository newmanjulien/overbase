<script lang="ts">
	import {
		ListContentState,
		ListPage,
		ListToolbar
	} from '$lib/components/list-page';
	import { InfoBar } from '$lib/components/ui';
	import {
		toBuilderAppRecord,
		type BuilderAppHomeData,
		type BuilderAppFilterId,
		type BuilderAppRecord
	} from '$lib/features/builder/catalog';
	import BuilderAppCard from './BuilderAppCard.svelte';

	type Props = {
		builderHome: BuilderAppHomeData;
	};

	let { builderHome }: Props = $props();
	let searchQuery = $state('');
	let selectedFilterId = $state<BuilderAppFilterId>('all');

	const filterOptions = $derived([
		{ id: 'all', label: 'Recommended for you' },
		...builderHome.categories.map((category) => ({
			id: category.slug,
			label: category.label
		}))
	]);
	const apps = $derived(builderHome.apps.map(toBuilderAppRecord));
	const selectedFilterLabel = $derived(
		filterOptions.find((option) => option.id === selectedFilterId)?.label ?? 'Recommended for you'
	);
	const visibleApps = $derived(apps.filter(matchesFilters));

	function normalizeSearchText(value: string) {
		return value.trim().toLowerCase();
	}

	function setSelectedFilter(optionId: string) {
		if (optionId === 'all' || builderHome.categories.some((category) => category.slug === optionId)) {
			selectedFilterId = optionId;
		}
	}

	function appMatchesCategory(app: BuilderAppRecord) {
		return selectedFilterId === 'all' || app.categoryIds.includes(selectedFilterId);
	}

	function getSearchableCardText(app: BuilderAppRecord) {
		return [app.id, app.title, app.description, ...app.details.paragraphs].join(' ');
	}

	function matchesFilters(app: BuilderAppRecord) {
		if (!appMatchesCategory(app)) {
			return false;
		}

		const normalizedQuery = normalizeSearchText(searchQuery);

		return !normalizedQuery || getSearchableCardText(app).toLowerCase().includes(normalizedQuery);
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
				label: selectedFilterLabel,
				selectedId: selectedFilterId,
				options: filterOptions,
				onSelect: setSelectedFilter
			}}
		/>
	{/snippet}

	{#if visibleApps.length === 0}
		<ListContentState kind="empty" message="No matching builders." class="rounded-sm border" />
	{:else}
		<div class="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-3 xl:grid-cols-4">
			{#each visibleApps as app (app.id)}
				<BuilderAppCard {app} />
			{/each}
		</div>
	{/if}

	{#snippet footer()}
		<InfoBar label="Next steps:">
			Start from a builder to create the opportunities your team receives
		</InfoBar>
	{/snippet}
</ListPage>
