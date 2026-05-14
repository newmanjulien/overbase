<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import {
		ListContentState,
		ListRoutePage,
		SelectableList
	} from '$lib/components/list-page';
	import { InfoBar } from '$lib/components/ui';
	import OpportunityFormatListRow from './OpportunityFormatListRow.svelte';
	import type { OpportunityFormatListItem } from './opportunity-format-list';

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	const client = useConvexClient();
	const formatsQuery = useQuery(api.opportunityFormats.listOpportunityFormats);
	let deletingFormatIds = $state<Id<'opportunityFormats'>[]>([]);
	let pausingFormatIds = $state<Id<'opportunityFormats'>[]>([]);
	let actionError = $state<string | null>(null);
	const formatItems = $derived((formatsQuery.data ?? []).map(toFormatItem));
	const listState = $derived(
		formatsQuery.isLoading
			? 'loading'
			: formatsQuery.error
				? 'error'
				: formatItems.length === 0
					? 'empty'
					: 'ready'
	);

	type OpportunityFormatListRecord = NonNullable<typeof formatsQuery.data>[number];

	function formatStatus(status: OpportunityFormatListRecord['status']) {
		return status === 'active' ? 'Active' : 'Paused';
	}

	function getStatusLabelClass(status: OpportunityFormatListRecord['status']) {
		return status === 'active' ? 'text-zinc-400' : 'text-red-300';
	}

	function isDeletingFormat(opportunityFormatId: Id<'opportunityFormats'>) {
		return deletingFormatIds.includes(opportunityFormatId);
	}

	function isPausingFormat(opportunityFormatId: Id<'opportunityFormats'>) {
		return pausingFormatIds.includes(opportunityFormatId);
	}

	function getActiveFormatIds(opportunityFormatIds: Id<'opportunityFormats'>[]) {
		const opportunityFormatIdSet = new Set(opportunityFormatIds);

		return (formatsQuery.data ?? [])
			.filter(
				(format) => opportunityFormatIdSet.has(format.id) && format.status === 'active'
			)
			.map((format) => format.id);
	}

	async function deleteFormats(opportunityFormatIds: Id<'opportunityFormats'>[]) {
		const idsToDelete = opportunityFormatIds.filter((id) => !isDeletingFormat(id));

		if (idsToDelete.length === 0) {
			return;
		}

		actionError = null;
		deletingFormatIds = [...deletingFormatIds, ...idsToDelete];

		try {
			await client.mutation(api.opportunityFormats.deleteOpportunityFormats, {
				opportunityFormatIds: idsToDelete
			});
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not delete formats.';
		} finally {
			deletingFormatIds = deletingFormatIds.filter((id) => !idsToDelete.includes(id));
		}
	}

	async function pauseFormats(opportunityFormatIds: Id<'opportunityFormats'>[]) {
		const idsToPause = getActiveFormatIds(opportunityFormatIds).filter(
			(id) => !isPausingFormat(id) && !isDeletingFormat(id)
		);

		if (idsToPause.length === 0) {
			return;
		}

		actionError = null;
		pausingFormatIds = [...pausingFormatIds, ...idsToPause];

		try {
			for (const opportunityFormatId of idsToPause) {
				await client.mutation(api.opportunityFormats.setOpportunityFormatStatus, {
					opportunityFormatId,
					status: 'paused'
				});
			}
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not pause formats.';
		} finally {
			pausingFormatIds = pausingFormatIds.filter((id) => !idsToPause.includes(id));
		}
	}

	function selectedFormatsIncludeActive(selectedFormatIds: string[]) {
		return getActiveFormatIds(selectedFormatIds as Id<'opportunityFormats'>[]).length > 0;
	}

	function toFormatItem(format: OpportunityFormatListRecord): OpportunityFormatListItem {
		const isDeleting = isDeletingFormat(format.id);
		const isPausing = isPausingFormat(format.id);
		const actionsDisabled = isDeleting || isPausing;
		const actions: OpportunityFormatListItem['actions'] = [
			{
				label: isDeleting ? 'Deleting...' : 'Delete',
				ariaLabel: `Delete ${format.title}`,
				intent: 'destructive' as const,
				disabled: actionsDisabled,
				onSelect: () => deleteFormats([format.id])
			}
		];

		if (format.status === 'active') {
			actions.unshift({
				label: isPausing ? 'Updating...' : 'Pause',
				ariaLabel: `Pause ${format.title}`,
				disabled: actionsDisabled,
				onSelect: () => pauseFormats([format.id])
			});
		}

		return {
			id: format.id,
			title: format.title,
			href: `/formats/${format.id}`,
			selectAriaLabel: `Select ${format.title}`,
			statusLabel: formatStatus(format.status),
			statusLabelClass: getStatusLabelClass(format.status),
			createdAtLabel: dateFormatter.format(new Date(format.createdAt)),
			creator: {
				name: format.createdByName,
				avatar: ''
			},
			actionsAriaLabel: 'Format actions',
			actions
		};
	}
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search formats...',
		searchAriaLabel: 'Search formats',
		filterLabel: 'All formats'
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY.formats.icon,
		title: 'No formats found',
		description: 'Build your first format with the format builder.',
		nextSteps: [
			{ kind: 'link', text: 'Build', href: '/builder' },
			{
				kind: 'text',
				text: ' your first format using the format builder then you will fine tune, add teammates and manage it here'
			}
		],
		learnMoreLabel: 'Learn more'
	}}
	hasItems={listState !== 'empty'}
>
	{#if listState === 'loading'}
		<ListContentState kind="loading" message="Loading formats..." />
	{:else if listState === 'error'}
		<ListContentState kind="error" message="Could not load formats." />
	{:else if listState === 'ready'}
		{#if actionError}
			<p class="border-b border-red-100 bg-red-50 px-4 py-2 text-[0.72rem] text-red-700 md:px-5">
				{actionError}
			</p>
		{/if}
		<SelectableList
			items={formatItems}
			selectAllAriaLabel="Select all formats"
			selectedActionsAriaLabel="Selected format actions"
			selectedActions={[
				{
					label: pausingFormatIds.length > 0 ? 'Updating...' : 'Pause selected',
					ariaLabel: 'Pause selected formats',
					disabled: (selectedFormatIds) =>
						pausingFormatIds.length > 0 ||
						!selectedFormatsIncludeActive(selectedFormatIds),
					onSelect: (selectedFormatIds) =>
						pauseFormats(selectedFormatIds as Id<'opportunityFormats'>[])
				},
				{
					label: deletingFormatIds.length > 0 ? 'Deleting...' : 'Delete',
					ariaLabel: 'Delete selected formats',
					intent: 'destructive',
					disabled: deletingFormatIds.length > 0,
					onSelect: (selectedFormatIds) =>
						deleteFormats(selectedFormatIds as Id<'opportunityFormats'>[])
				}
			]}
			rowActionsAriaLabel="Format actions"
		>
			{#snippet rowCells(item)}
				<OpportunityFormatListRow {item} />
			{/snippet}
		</SelectableList>
	{/if}

	{#snippet footer()}
		{#if listState === 'ready'}
			<InfoBar label="Next steps:">
				Click on your format to set the rules for when it should fire and to configure which teammates should receive it
			</InfoBar>
		{/if}
	{/snippet}
</ListRoutePage>
