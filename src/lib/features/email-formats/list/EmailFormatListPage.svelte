<script lang="ts">
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

	type EmailFormatStatus = 'active' | 'paused';
	type EmailFormatListRecord = {
		id: string;
		title: string;
		status: EmailFormatStatus;
		createdAt: number;
		creator: {
			name: string;
			avatarUrl: string;
		};
	};
	type FormatStatusFilterId = 'all' | EmailFormatStatus;

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	const formats = $state<EmailFormatListRecord[]>([]);
	let searchQuery = $state('');
	let selectedStatusFilter = $state<FormatStatusFilterId>('all');
	const formatItems = $derived(formats.map(toFormatItem));
	const filteredFormatItems = $derived(formatItems.filter(matchesFormatFilters));
	const listState = $derived(formatItems.length === 0 ? 'empty' : 'ready');

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

	function toFormatItem(format: EmailFormatListRecord): EmailFormatListItem {
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
							label: 'Pause',
							ariaLabel: `Pause ${format.title}`,
							disabled: true,
							onSelect: () => {}
						}
					: {
							label: 'Activate',
							ariaLabel: `Activate ${format.title}`,
							disabled: true,
							onSelect: () => {}
						},
				{
					label: 'Delete',
					ariaLabel: `Delete ${format.title}`,
					intent: 'destructive',
					disabled: true,
					onSelect: () => {}
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
	{#if listState === 'ready'}
		{#if filteredFormatItems.length === 0}
			<ListContentState kind="empty" message="No matching email formats." />
		{:else}
			<SelectableList
				items={filteredFormatItems}
			selectAllAriaLabel="Select all email formats"
			selectedActionsAriaLabel="Selected email format actions"
			selectedActions={[
				{
					label: 'Pause selected',
					ariaLabel: 'Pause selected email formats',
					disabled: true,
					onSelect: () => {}
				},
				{
					label: 'Delete',
					ariaLabel: 'Delete selected email formats',
					intent: 'destructive',
					disabled: true,
					onSelect: () => {}
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
