<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import {
		ListRows,
		ListRoutePage,
		type EmptyListStateConfig,
		type ListRouteStatus,
		type NoResultsListStateConfig
	} from '$lib/patterns/list-page';
	import AddExternalDataModal from '$lib/features/external-data/AddExternalDataModal.svelte';
	import ExternalDataDetailsModal, {
		type ExternalDataDetails
	} from '$lib/features/external-data/ExternalDataDetailsModal.svelte';
	import type { ContactImport } from '$lib/features/external-data/linkedin-contacts-csv';
	import ExternalDataListRow, {
		type ExternalDataListItem
	} from '$lib/features/external-data/ExternalDataListRow.svelte';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import { useConvexClient, useQuery } from 'convex-svelte';

	const client = useConvexClient();
	const externalDataQuery = useQuery(api.externalData.listExternalDataSources, () => ({}));
	const LINKEDIN_CONTACTS_LOGO_SRC = '/logos/linkedin.png';

	type ExternalDataSourceListRecord = NonNullable<typeof externalDataQuery.data>[number];
	type ExternalDataTypeFilterId = 'all' | 'linkedin-contacts';

	let modalOpen = $state(false);
	let detailsSource = $state<ExternalDataDetails | null>(null);
	let searchQuery = $state('');
	let selectedTypeFilter = $state<ExternalDataTypeFilterId>('all');
	let actionError = $state<string | null>(null);
	let deletingSourceId = $state<Id<'externalDataSources'> | null>(null);
	let replacingSourceId = $state<Id<'externalDataSources'> | null>(null);
	let renamingSourceId = $state<Id<'externalDataSources'> | null>(null);

	const externalDataSources = $derived(externalDataQuery.data ?? []);
	const typeFilterOptions: { id: ExternalDataTypeFilterId; label: string }[] = [
		{ id: 'all', label: 'All types' },
		{ id: 'linkedin-contacts', label: 'LinkedIn contacts' }
	];
	const selectedTypeFilterLabel = $derived(
		typeFilterOptions.find((option) => option.id === selectedTypeFilter)?.label ?? 'All types'
	);
	const externalDataItems = $derived(externalDataSources.map(toExternalDataItem));
	const filteredExternalDataItems = $derived(
		externalDataItems.filter(matchesExternalDataFilters)
	);
	const emptyListState = {
		icon: APP_ROUTE_REGISTRY['external-data'].icon,
		title: 'No external data found',
		description: 'Connect external data sources to enrich your opportunities.',
		nextSteps:
			'Overbase can pull from external data sources you purchase. Connect external data sources, then use them to power your opportunities',
		actionLabel: 'Add external data',
		onAction: () => (modalOpen = true)
	} satisfies EmptyListStateConfig;
	const noResultsState = {
		title: 'No matching external data sources',
		description: 'Try a different search term or data type'
	} satisfies NoResultsListStateConfig;
	const listStatus = $derived<ListRouteStatus>(
		externalDataQuery.isLoading
			? 'loading'
			: externalDataQuery.error
				? 'error'
				: 'ready'
	);
	const totalRecords = $derived(externalDataItems.length);
	const visibleRecords = $derived(filteredExternalDataItems.length);
	const isQueryActive = $derived(Boolean(searchQuery.trim()) || selectedTypeFilter !== 'all');

	function normalizeSearchText(value: string) {
		return value.trim().toLowerCase();
	}

	function getExternalDataType(source: ExternalDataSourceListRecord) {
		return source.kind === 'linkedinContacts' ? 'LinkedIn contacts' : 'External data';
	}

	function getExternalDataTypeFilterId(item: ExternalDataListItem): ExternalDataTypeFilterId {
		return item.type === 'LinkedIn contacts' ? 'linkedin-contacts' : 'all';
	}

	function matchesExternalDataFilters(item: ExternalDataListItem) {
		const normalizedQuery = normalizeSearchText(searchQuery);

		return (
			(selectedTypeFilter === 'all' ||
				getExternalDataTypeFilterId(item) === selectedTypeFilter) &&
			(!normalizedQuery ||
				[item.name, item.type].some((value) =>
					value.toLowerCase().includes(normalizedQuery)
				))
		);
	}

	function openDetails(source: ExternalDataDetails) {
		actionError = null;
		detailsSource = source;
	}

	function toExternalDataDetails(source: ExternalDataSourceListRecord): ExternalDataDetails {
		return {
			id: source.id,
			name: source.name,
			type: getExternalDataType(source),
			sourceFileName: source.sourceFileName
		};
	}

	function toExternalDataItem(source: ExternalDataSourceListRecord): ExternalDataListItem {
		const details = toExternalDataDetails(source);

		return {
			id: source.id,
			name: source.name,
			type: details.type,
			logoSrc: LINKEDIN_CONTACTS_LOGO_SRC,
			onManage: () => openDetails(details)
		};
	}

	function closeDetails() {
		if (deletingSourceId || replacingSourceId || renamingSourceId) {
			return;
		}

		detailsSource = null;
		actionError = null;
	}

	async function deleteExternalDataSource(sourceId: Id<'externalDataSources'>) {
		if (deletingSourceId || replacingSourceId || renamingSourceId) {
			return;
		}

		actionError = null;
		deletingSourceId = sourceId;

		try {
			await client.mutation(api.externalData.deleteExternalDataSource, {
				externalDataSourceId: sourceId
			});
			detailsSource = null;
		} catch (error) {
			actionError =
				error instanceof Error ? error.message : 'Could not delete external data source.';
		} finally {
			deletingSourceId = null;
		}
	}

	async function renameExternalDataSource(
		sourceId: Id<'externalDataSources'>,
		name: string
	) {
		if (deletingSourceId || replacingSourceId || renamingSourceId) {
			return;
		}

		actionError = null;
		renamingSourceId = sourceId;

		try {
			const result = await client.mutation(api.externalData.renameExternalDataSource, {
				externalDataSourceId: sourceId,
				name
			});

			if (detailsSource?.id === sourceId) {
				detailsSource = {
					...detailsSource,
					name: result.name
				};
			}
		} catch (error) {
			actionError =
				error instanceof Error ? error.message : 'Could not rename external data source.';
		} finally {
			renamingSourceId = null;
		}
	}

	async function replaceExternalDataSource(
		sourceId: Id<'externalDataSources'>,
		contactsImport: ContactImport
	) {
		if (deletingSourceId || replacingSourceId || renamingSourceId) {
			return false;
		}

		actionError = null;
		replacingSourceId = sourceId;

		try {
			const result = await client.mutation(api.externalData.replaceExternalDataSource, {
				externalDataSourceId: sourceId,
				externalDataImport: {
					kind: 'linkedinContacts',
					fileName: contactsImport.fileName,
					contacts: contactsImport.contacts
				}
			});

			if (detailsSource?.id === sourceId) {
				detailsSource = {
					...detailsSource,
					sourceFileName: result.sourceFileName
				};
			}

			return true;
		} catch (error) {
			actionError =
				error instanceof Error ? error.message : 'Could not replace external data source.';
			return false;
		} finally {
			replacingSourceId = null;
		}
	}
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search external data sources...',
		searchAriaLabel: 'Search external data sources',
		searchValue: searchQuery,
		onSearchValueChange: (value) => (searchQuery = value),
		filter: {
			label: selectedTypeFilterLabel,
			selectedId: selectedTypeFilter,
			options: typeFilterOptions,
			onSelect: (optionId) => {
				if (optionId === 'all' || optionId === 'linkedin-contacts') {
					selectedTypeFilter = optionId;
				}
			}
		},
		actionLabel: 'Add external data',
		onAction: () => (modalOpen = true)
	}}
	empty={emptyListState}
	noResults={noResultsState}
	status={listStatus}
	{totalRecords}
	{visibleRecords}
	{isQueryActive}
	loadingMessage="Loading external data sources..."
	errorMessage="Could not load external data sources."
>
	<ListRows
		items={filteredExternalDataItems}
		rowActionsAriaLabel="External data actions"
	>
		{#snippet rowCells(item)}
			<ExternalDataListRow {item} />
		{/snippet}
	</ListRows>
</ListRoutePage>

<AddExternalDataModal open={modalOpen} onClose={() => (modalOpen = false)} />
<ExternalDataDetailsModal
	open={Boolean(detailsSource)}
	source={detailsSource}
	deleting={deletingSourceId === detailsSource?.id}
	replacing={replacingSourceId === detailsSource?.id}
	renaming={renamingSourceId === detailsSource?.id}
	error={actionError}
	onClose={closeDetails}
	onDelete={deleteExternalDataSource}
	onRename={renameExternalDataSource}
	onReplace={replaceExternalDataSource}
/>
