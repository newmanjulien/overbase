<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import {
		ListContentState,
		ListRoutePage,
		SelectableList
	} from '$lib/components/list-page';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import AddTeammatesModal from './AddTeammatesModal.svelte';
	import TeammateListRow, { type TeammateItem } from './TeammateListRow.svelte';
	import { parseTeammateEmailInput } from './teammate-email-input';

	const client = useConvexClient();
	const teammatesQuery = useQuery(api.teammates.listTeammates);
	let modalOpen = $state(false);
	let teammateEmails = $state('');
	let modalError = $state<string | null>(null);
	let isAddingTeammates = $state(false);
	let deletingTeammateIds = $state<Id<'teammates'>[]>([]);
	let actionError = $state<string | null>(null);
	let editingTeammateId = $state<Id<'teammates'> | null>(null);
	let savingTeammateId = $state<Id<'teammates'> | null>(null);
	let searchQuery = $state('');
	let selectedRoleFilter = $state('all');
	let teammateDraft = $state({
		name: '',
		email: '',
		role: ''
	});
	const teammateItems = $derived((teammatesQuery.data ?? []).map(toTeammateItem));
	const roleFilterOptions = $derived(getRoleFilterOptions(teammatesQuery.data ?? []));
	const selectedRoleFilterLabel = $derived(
		roleFilterOptions.find((option) => option.id === selectedRoleFilter)?.label ?? 'All roles'
	);
	const filteredTeammateItems = $derived(teammateItems.filter(matchesTeammateFilters));
	const listState = $derived(
		teammatesQuery.isLoading
			? 'loading'
			: teammatesQuery.error
				? 'error'
				: teammateItems.length === 0
					? 'empty'
					: 'ready'
	);

	type TeammateRecord = NonNullable<typeof teammatesQuery.data>[number];

	$effect(() => {
		if (!roleFilterOptions.some((option) => option.id === selectedRoleFilter)) {
			selectedRoleFilter = 'all';
		}
	});

	function normalizeSearchText(value: string) {
		return value.trim().toLowerCase();
	}

	function normalizeRole(value: string) {
		return value.trim();
	}

	function roleFilterKey(role: string) {
		return normalizeRole(role).toLowerCase();
	}

	function roleFilterId(role: string) {
		const roleKey = roleFilterKey(role);
		return roleKey ? `role:${roleKey}` : 'no-role';
	}

	function getRoleFilterOptions(teammates: TeammateRecord[]) {
		const roles: { key: string; label: string }[] = [];

		for (const teammate of teammates) {
			const role = normalizeRole(teammate.role);
			const roleKey = roleFilterKey(role);

			if (roleKey && !roles.some((existingRole) => existingRole.key === roleKey)) {
				roles.push({ key: roleKey, label: role });
			}
		}

		const sortedRoles = [...roles].sort(
			(firstRole, secondRole) =>
				firstRole.label.localeCompare(secondRole.label) ||
				firstRole.key.localeCompare(secondRole.key)
		);
		const hasNoRole = teammates.some((teammate) => normalizeRole(teammate.role).length === 0);

		return [
			{ id: 'all', label: 'All roles' },
			...sortedRoles.map((role) => ({ id: `role:${role.key}`, label: role.label })),
			...(hasNoRole ? [{ id: 'no-role', label: 'No role' }] : [])
		];
	}

	function setSelectedRoleFilter(optionId: string) {
		selectedRoleFilter = optionId;
	}

	function matchesTeammateFilters(item: TeammateItem) {
		if (selectedRoleFilter !== 'all' && roleFilterId(item.role) !== selectedRoleFilter) {
			return false;
		}

		const normalizedQuery = normalizeSearchText(searchQuery);

		if (!normalizedQuery) {
			return true;
		}

		return [item.displayName, item.email, item.role].some((value) =>
			value.toLowerCase().includes(normalizedQuery)
		);
	}

	function openModal() {
		modalError = null;
		modalOpen = true;
	}

	function closeModal() {
		if (isAddingTeammates) {
			return;
		}

		modalOpen = false;
		modalError = null;
	}

	function updateTeammateEmails(value: string) {
		teammateEmails = value;
	}

	async function addTeammates() {
		if (isAddingTeammates) {
			return;
		}

		const result = parseTeammateEmailInput(teammateEmails);

		if (result.error) {
			modalError = result.error;
			return;
		}

		modalError = null;
		isAddingTeammates = true;

		try {
			await client.mutation(api.teammates.addTeammates, {
				emails: result.emails
			});
			teammateEmails = '';
			modalOpen = false;
		} catch (error) {
			modalError = error instanceof Error ? error.message : 'Could not add teammates.';
		} finally {
			isAddingTeammates = false;
		}
	}

	function isDeletingTeammate(teammateId: Id<'teammates'>) {
		return deletingTeammateIds.includes(teammateId);
	}

	function editTeammate(teammate: TeammateRecord) {
		actionError = null;
		editingTeammateId = teammate.id;
		teammateDraft = {
			name: teammate.name,
			email: teammate.email,
			role: teammate.role
		};
	}

	function closeTeammateEditor() {
		editingTeammateId = null;
		teammateDraft = {
			name: '',
			email: '',
			role: ''
		};
	}

	function updateTeammateNameDraft(name: string) {
		teammateDraft = {
			...teammateDraft,
			name
		};
	}

	function updateTeammateEmailDraft(email: string) {
		teammateDraft = {
			...teammateDraft,
			email
		};
	}

	function updateTeammateRoleDraft(role: string) {
		teammateDraft = {
			...teammateDraft,
			role
		};
	}

	async function saveTeammate(teammate: TeammateRecord) {
		if (savingTeammateId) {
			return;
		}

		actionError = null;
		savingTeammateId = teammate.id;

		try {
			await client.mutation(api.teammates.updateTeammate, {
				teammateId: teammate.id,
				name: teammateDraft.name,
				email: teammateDraft.email,
				role: teammateDraft.role
			});
			closeTeammateEditor();
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not update teammate.';
		} finally {
			savingTeammateId = null;
		}
	}

	async function deleteTeammates(teammateIds: Id<'teammates'>[]) {
		const idsToDelete = teammateIds.filter((id) => !isDeletingTeammate(id));

		if (idsToDelete.length === 0) {
			return;
		}

		actionError = null;
		deletingTeammateIds = [...deletingTeammateIds, ...idsToDelete];

		try {
			await client.mutation(api.teammates.deleteTeammates, {
				teammateIds: idsToDelete
			});
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not delete teammates.';
		} finally {
			deletingTeammateIds = deletingTeammateIds.filter((id) => !idsToDelete.includes(id));
		}
	}

	function toTeammateItem(teammate: TeammateRecord): TeammateItem {
		const isDeleting = isDeletingTeammate(teammate.id);
		const isEditing = editingTeammateId === teammate.id;
		const isSaving = savingTeammateId === teammate.id;
		const isBusy = isDeleting || isSaving;

		return {
			id: teammate.id,
			email: teammate.email,
			role: teammate.role,
			displayName: teammate.displayName,
			isEditing,
			nameDraft: isEditing ? teammateDraft.name : '',
			emailDraft: isEditing ? teammateDraft.email : teammate.email,
			roleDraft: isEditing ? teammateDraft.role : teammate.role,
			deleteLabel: isDeleting ? 'Deleting...' : 'Delete',
			saveLabel: isSaving ? 'Saving...' : 'Save',
			deleteDisabled: isBusy,
			saveDisabled: isBusy,
			onEdit: () => editTeammate(teammate),
			onCancel: closeTeammateEditor,
			onSave: () => saveTeammate(teammate),
			onDelete: () => deleteTeammates([teammate.id]),
			onNameDraftChange: updateTeammateNameDraft,
			onEmailDraftChange: updateTeammateEmailDraft,
			onRoleDraftChange: updateTeammateRoleDraft,
			selectAriaLabel: `Select ${teammate.displayName}`,
			actionsAriaLabel: 'Teammate actions',
			actions: isEditing
				? undefined
				: [
						{
							label: isDeleting ? 'Deleting...' : 'Delete',
							ariaLabel: `Delete ${teammate.displayName}`,
							intent: 'destructive',
							disabled: isDeleting,
							onSelect: () => deleteTeammates([teammate.id])
						}
					]
		};
	}
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search teammates...',
		searchAriaLabel: 'Search teammates',
		searchValue: searchQuery,
		onSearchValueChange: (value) => (searchQuery = value),
		filter: {
			label: selectedRoleFilterLabel,
			selectedId: selectedRoleFilter,
			options: roleFilterOptions,
			onSelect: setSelectedRoleFilter
		},
		actionLabel: 'Add teammates',
		onAction: openModal
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY.team.icon,
		title: 'No teammates found',
		description: [
			{ kind: 'text', text: 'Add teammates and we ' },
			{
				kind: 'tooltip',
				label: "won't email them",
				tooltipText:
					"We won't email teammates after you add them. They'll only receive emails after you add them to an active opportunity format"
			},
			{ kind: 'text', text: 'until you add them to opportunities' }
		],
		nextSteps:
			'Teammates are the people inside your organization who receive opportunities. Add teammates here, then add them to the right formats',
		actionLabel: 'Add teammates',
		onAction: openModal
	}}
	hasItems={listState !== 'empty'}
>
	{#if listState === 'loading'}
		<ListContentState kind="loading" message="Loading teammates..." />
	{:else if listState === 'error'}
		<ListContentState kind="error" message="Could not load teammates." />
	{:else if listState === 'ready'}
		{#if actionError}
			<p class="border-b border-red-100 bg-red-50 px-4 py-2 text-[0.72rem] text-red-700 md:px-5">
				{actionError}
			</p>
		{/if}
		{#if filteredTeammateItems.length === 0}
			<ListContentState kind="empty" message="No matching teammates." />
		{:else}
			<SelectableList
				items={filteredTeammateItems}
			selectAllAriaLabel="Select all teammates"
			selectedActionsAriaLabel="Selected teammate actions"
			selectedActions={[
				{
					label: deletingTeammateIds.length > 0 ? 'Deleting...' : 'Delete',
					ariaLabel: 'Delete selected teammates',
					intent: 'destructive',
					disabled: deletingTeammateIds.length > 0,
					onSelect: (selectedTeammateIds) =>
						deleteTeammates(selectedTeammateIds as Id<'teammates'>[])
				}
			]}
			rowActionsAriaLabel="Teammate actions"
		>
			{#snippet rowCells(item)}
				<TeammateListRow {item} />
			{/snippet}
			</SelectableList>
		{/if}
	{/if}
</ListRoutePage>

<AddTeammatesModal
	error={modalError}
	isAdding={isAddingTeammates}
	open={modalOpen}
	value={teammateEmails}
	onClose={closeModal}
	onSubmit={addTeammates}
	onValueChange={updateTeammateEmails}
/>
