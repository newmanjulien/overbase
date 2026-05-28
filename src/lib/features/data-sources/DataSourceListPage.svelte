<script lang="ts">
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import { ListContentState, ListRows, ListRoutePage } from '$lib/patterns/list-page';
	import AddDataSourceModal from './AddDataSourceModal.svelte';
	import DataSourceListRow, { type DataSourceListItem } from './DataSourceListRow.svelte';

	const DATA_SOURCE_LOGO_SRC = '/logo.png';

	const sampleDataSources = [
		{
			id: 'mongodb-atlas',
			name: 'MongoDB Atlas',
			type: 'Storage',
			shared: true,
			logoSrc: DATA_SOURCE_LOGO_SRC
		},
		{
			id: 'hubspot',
			name: 'HubSpot',
			type: 'CRM',
			shared: false,
			logoSrc: DATA_SOURCE_LOGO_SRC
		},
		{
			id: 'google-drive',
			name: 'Google Drive',
			type: 'Files',
			shared: false,
			logoSrc: DATA_SOURCE_LOGO_SRC
		},
		{
			id: 'slack',
			name: 'Slack',
			type: 'Messaging',
			shared: false,
			logoSrc: DATA_SOURCE_LOGO_SRC
		}
	] as const;

	const SHOW_DATA_SOURCE_LIST_UI = false;
	const visibleDataSources: readonly (typeof sampleDataSources)[number][] = SHOW_DATA_SOURCE_LIST_UI
		? sampleDataSources
		: [];

	let modalOpen = $state(false);
	let searchQuery = $state('');
	let selectedTypeFilter = $state('all');

	const typeFilterOptions = $derived([
		{ id: 'all', label: 'All types' },
		...visibleDataSources.map((source) => ({ id: source.type.toLowerCase(), label: source.type }))
	]);
	const selectedTypeFilterLabel = $derived(
		typeFilterOptions.find((option) => option.id === selectedTypeFilter)?.label ?? 'All types'
	);
	const dataSourceItems = $derived(visibleDataSources.map(toDataSourceItem));
	const filteredDataSourceItems = $derived(dataSourceItems.filter(matchesDataSourceFilters));

	function normalizeSearchText(value: string) {
		return value.trim().toLowerCase();
	}

	function matchesDataSourceFilters(item: DataSourceListItem) {
		const normalizedQuery = normalizeSearchText(searchQuery);

		return (
			(selectedTypeFilter === 'all' || item.type.toLowerCase() === selectedTypeFilter) &&
			(!normalizedQuery ||
				[item.name, item.type, item.shared ? 'shared' : ''].some((value) =>
					value.toLowerCase().includes(normalizedQuery)
				))
		);
	}

	function toDataSourceItem(source: (typeof sampleDataSources)[number]): DataSourceListItem {
		return {
			...source,
			onManage: () => {}
		};
	}
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search data sources...',
		searchAriaLabel: 'Search data sources',
		searchValue: searchQuery,
		onSearchValueChange: (value) => (searchQuery = value),
		filter: {
			label: selectedTypeFilterLabel,
			selectedId: selectedTypeFilter,
			options: typeFilterOptions,
			onSelect: (optionId) => (selectedTypeFilter = optionId)
		},
		actionLabel: 'Add data source',
		onAction: () => (modalOpen = true)
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY['data-sources'].icon,
		title: 'No data sources found',
		description: 'Connect data sources to power your opportunities.',
		nextSteps:
			'Overbase can analyze any of your internal data sources. Add the data sources you want us to use to send you actionable opportunities or that you want to share with your ecosystem partners',
		learnMoreLabel: 'Learn more',
		actionLabel: 'Add data source',
		onAction: () => (modalOpen = true)
	}}
	hasItems={dataSourceItems.length > 0}
>
	{#if filteredDataSourceItems.length === 0}
		<ListContentState kind="empty" message="No matching data sources." />
	{:else}
		<ListRows
			items={filteredDataSourceItems}
			rowActionsAriaLabel="Data source actions"
		>
			{#snippet rowCells(item)}
				<DataSourceListRow {item} />
			{/snippet}
		</ListRows>
	{/if}
</ListRoutePage>

<AddDataSourceModal open={modalOpen} onClose={() => (modalOpen = false)} />
