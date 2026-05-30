<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { APP_LINKS, emailFormatLink } from '$lib/app/app-links';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import {
		ListContentState,
		ListRoutePage,
		SelectableList
	} from '$lib/patterns/list-page';
	import { InfoBar } from '$lib/ui';
	import EmailFormatListRow, {
		type EmailFormatListItem
	} from './EmailFormatListRow.svelte';

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	const client = useConvexClient();
	const formatsQuery = useQuery(api.emailFormats.listEmailFormats);
	let deletingFormatIds = $state<Id<'emailFormats'>[]>([]);
	let pausingFormatIds = $state<Id<'emailFormats'>[]>([]);
	let actionError = $state<string | null>(null);
	let searchQuery = $state('');
	let selectedStatusFilter = $state<'all' | EmailFormatListRecord['status']>('all');
	const formatItems = $derived((formatsQuery.data ?? []).map(toFormatItem));
	const filteredFormatItems = $derived(formatItems.filter(matchesFormatFilters));
	const listState = $derived(
		formatsQuery.isLoading
			? 'loading'
			: formatsQuery.error
				? 'error'
				: formatItems.length === 0
					? 'empty'
					: 'ready'
	);

	type EmailFormatListRecord = NonNullable<typeof formatsQuery.data>[number];
	type FormatStatusFilterId = 'all' | EmailFormatListRecord['status'];

	const statusFilterOptions: { id: FormatStatusFilterId; label: string }[] = [
		{ id: 'all', label: 'All email formats' },
		{ id: 'active', label: 'Active' },
		{ id: 'paused', label: 'Paused' }
	];

	const selectedStatusFilterLabel = $derived(
		statusFilterOptions.find((option) => option.id === selectedStatusFilter)?.label ?? 'All email formats'
	);

	function formatStatus(status: EmailFormatListRecord['status']) {
		return status === 'active' ? 'Active' : 'Paused';
	}

	function normalizeSearchText(value: string) {
		return value.trim().toLowerCase();
	}

	function setSelectedStatusFilter(optionId: string) {
		if (optionId === 'all' || optionId === 'active' || optionId === 'paused') {
			selectedStatusFilter = optionId;
		}
	}

	function matchesFormatFilters(item: EmailFormatListItem) {
		const normalizedQuery = normalizeSearchText(searchQuery);

		return (
			(selectedStatusFilter === 'all' || item.status === selectedStatusFilter) &&
			(!normalizedQuery ||
				[item.title, item.creator.name].some((value) =>
					value.toLowerCase().includes(normalizedQuery)
				))
		);
	}

	function getStatusLabelClass(status: EmailFormatListRecord['status']) {
		return status === 'active' ? 'text-stone-400' : 'text-red-300';
	}

	function isDeletingFormat(emailFormatId: Id<'emailFormats'>) {
		return deletingFormatIds.includes(emailFormatId);
	}

	function isPausingFormat(emailFormatId: Id<'emailFormats'>) {
		return pausingFormatIds.includes(emailFormatId);
	}

	function getActiveFormatIds(emailFormatIds: Id<'emailFormats'>[]) {
		const emailFormatIdSet = new Set(emailFormatIds);

		return (formatsQuery.data ?? [])
			.filter(
				(format) => emailFormatIdSet.has(format.id) && format.status === 'active'
			)
			.map((format) => format.id);
	}

	async function deleteFormats(emailFormatIds: Id<'emailFormats'>[]) {
		const idsToDelete = emailFormatIds.filter((id) => !isDeletingFormat(id));

		if (idsToDelete.length === 0) {
			return;
		}

		actionError = null;
		deletingFormatIds = [...deletingFormatIds, ...idsToDelete];

		try {
			await client.mutation(api.emailFormats.deleteEmailFormats, {
				emailFormatIds: idsToDelete
			});
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not delete email formats.';
		} finally {
			deletingFormatIds = deletingFormatIds.filter((id) => !idsToDelete.includes(id));
		}
	}

	async function pauseFormats(emailFormatIds: Id<'emailFormats'>[]) {
		const idsToPause = getActiveFormatIds(emailFormatIds).filter(
			(id) => !isPausingFormat(id) && !isDeletingFormat(id)
		);

		if (idsToPause.length === 0) {
			return;
		}

		actionError = null;
		pausingFormatIds = [...pausingFormatIds, ...idsToPause];

		try {
			for (const emailFormatId of idsToPause) {
				await client.mutation(api.emailFormats.setEmailFormatStatus, {
					emailFormatId,
					status: 'paused'
				});
			}
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not pause email formats.';
		} finally {
			pausingFormatIds = pausingFormatIds.filter((id) => !idsToPause.includes(id));
		}
	}

	function selectedFormatsIncludeActive(selectedFormatIds: string[]) {
		return getActiveFormatIds(selectedFormatIds as Id<'emailFormats'>[]).length > 0;
	}

	function toFormatItem(format: EmailFormatListRecord): EmailFormatListItem {
		const isDeleting = isDeletingFormat(format.id);
		const isPausing = isPausingFormat(format.id);
		const actionsDisabled = isDeleting || isPausing;

		return {
			id: format.id,
			title: format.title,
			status: format.status,
			href: emailFormatLink(format.id).pathname,
			selectAriaLabel: `Select ${format.title}`,
			statusLabel: formatStatus(format.status),
			statusLabelClass: getStatusLabelClass(format.status),
			createdAtLabel: dateFormatter.format(new Date(format.createdAt)),
			creator: {
				name: format.creator.name,
				avatarUrl: format.creator.avatarUrl
			},
			actionsAriaLabel: 'Email format actions',
			actions: [
				format.status === 'active'
					? {
							label: isPausing ? 'Updating...' : 'Pause',
							ariaLabel: `Pause ${format.title}`,
							disabled: actionsDisabled,
							onSelect: () => pauseFormats([format.id])
						}
					: {
							label: 'Activate',
							ariaLabel: `Activate ${format.title}`,
							disabled: true,
							onSelect: () => {}
						},
				{
					label: isDeleting ? 'Deleting...' : 'Delete',
					ariaLabel: `Delete ${format.title}`,
					intent: 'destructive',
					disabled: actionsDisabled,
					onSelect: () => deleteFormats([format.id])
				}
			]
		};
	}
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search email formats...',
		searchAriaLabel: 'Search email formats',
		searchValue: searchQuery,
		onSearchValueChange: (value) => (searchQuery = value),
		filter: {
			label: selectedStatusFilterLabel,
			selectedId: selectedStatusFilter,
			options: statusFilterOptions,
			onSelect: setSelectedStatusFilter
		}
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY["email-formats"].icon,
		title: 'No email formats found',
		description: 'Use a build format to shape your first local email draft.',
		nextSteps: [
			{ kind: 'link', text: 'Build', href: APP_LINKS.buildFormats.pathname },
			{
				kind: 'text',
				text: ' the format of the emails your team will receive'
			}
		],
		learnMoreLabel: 'Learn more'
	}}
	hasItems={listState !== 'empty'}
>
	{#if listState === 'loading'}
		<ListContentState kind="loading" message="Loading email formats..." />
	{:else if listState === 'error'}
		<ListContentState kind="error" message="Could not load email formats." />
	{:else if listState === 'ready'}
		{#if actionError}
			<p class="border-b border-red-100 bg-red-50 px-4 py-2 text-[0.72rem] text-red-700 md:px-5">
				{actionError}
			</p>
		{/if}
		{#if filteredFormatItems.length === 0}
			<ListContentState kind="empty" message="No matching email formats." />
		{:else}
			<SelectableList
				items={filteredFormatItems}
			selectAllAriaLabel="Select all email formats"
			selectedActionsAriaLabel="Selected email format actions"
			selectedActions={[
				{
					label: pausingFormatIds.length > 0 ? 'Updating...' : 'Pause selected',
					ariaLabel: 'Pause selected email formats',
					disabled: (selectedFormatIds) =>
						pausingFormatIds.length > 0 ||
						!selectedFormatsIncludeActive(selectedFormatIds),
					onSelect: (selectedFormatIds) =>
						pauseFormats(selectedFormatIds as Id<'emailFormats'>[])
				},
				{
					label: deletingFormatIds.length > 0 ? 'Deleting...' : 'Delete',
					ariaLabel: 'Delete selected email formats',
					intent: 'destructive',
					disabled: deletingFormatIds.length > 0,
					onSelect: (selectedFormatIds) =>
						deleteFormats(selectedFormatIds as Id<'emailFormats'>[])
				}
			]}
			rowActionsAriaLabel="Email format actions"
		>
			{#snippet rowCells(item)}
				<EmailFormatListRow {item} />
			{/snippet}
			</SelectableList>
		{/if}
	{/if}

	{#snippet footer()}
		{#if listState === 'ready'}
			<InfoBar label="Next steps:">
				Click an email format to set its rules and configure which teammates should receive it
			</InfoBar>
		{/if}
	{/snippet}
</ListRoutePage>
