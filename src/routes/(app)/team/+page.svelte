<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import { APP_ROUTE_REGISTRY } from '$lib/app/app-routes';
	import {
		ListRoutePage,
		SelectableList,
		type EmptyListStateConfig,
		type ListRouteStatus,
		type NoResultsListStateConfig
	} from '$lib/layout/list';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import AddTeamMembersModal from '$lib/features/team-members/list/AddTeamMembersModal.svelte';
	import TeamMemberListRow, {
		type TeamMemberItem
	} from '$lib/features/team-members/list/TeamMemberListRow.svelte';
	import { parseTeamMemberEmailInput } from '$lib/features/team-members/list/team-member-email-input';

	const client = useConvexClient();
	const teamMembersQuery = useQuery(api.teamMembers.listTeamMembers);
	let modalOpen = $state(false);
	let teamMemberEmails = $state('');
	let modalError = $state<string | null>(null);
	let isAddingTeamMembers = $state(false);
	let deletingTeamMemberIds = $state<Id<'teamMembers'>[]>([]);
	let actionError = $state<string | null>(null);
	let notificationWarning = $state<string | null>(null);
	let editingTeamMemberId = $state<Id<'teamMembers'> | null>(null);
	let savingTeamMemberId = $state<Id<'teamMembers'> | null>(null);
	let searchQuery = $state('');
	let selectedRoleFilter = $state('all');
	let teamMemberDraft = $state({
		name: '',
		email: '',
		role: ''
	});
	const teamMemberItems = $derived((teamMembersQuery.data ?? []).map(toTeamMemberItem));
	const roleFilterOptions = $derived(getRoleFilterOptions(teamMembersQuery.data ?? []));
	const selectedRoleFilterLabel = $derived(
		roleFilterOptions.find((option) => option.id === selectedRoleFilter)?.label ?? 'All roles'
	);
	const filteredTeamMemberItems = $derived(teamMemberItems.filter(matchesTeamMemberFilters));
	const emptyListState = {
		icon: APP_ROUTE_REGISTRY.team.icon,
		title: 'No team members found',
		description: [
			{ kind: 'text', text: 'Add team members so you can assign them to email formats' }
		],
		nextSteps:
			'Team members are the people inside your organization who receive emails. Add team members here, then add them to the right email formats',
		actionLabel: 'Add team members',
		onAction: openModal
	} satisfies EmptyListStateConfig;
	const noResultsState = {
		title: 'No matching team members',
		description: 'Try a different search term, email, or role'
	} satisfies NoResultsListStateConfig;
	const listStatus = $derived<ListRouteStatus>(
		teamMembersQuery.isLoading
			? 'loading'
			: teamMembersQuery.error
				? 'error'
				: 'ready'
	);
	const totalRecords = $derived(teamMemberItems.length);
	const visibleRecords = $derived(filteredTeamMemberItems.length);
	const isQueryActive = $derived(Boolean(searchQuery.trim()) || selectedRoleFilter !== 'all');

	type TeamMemberRecord = NonNullable<typeof teamMembersQuery.data>[number];

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

	function getRoleFilterOptions(teamMembers: TeamMemberRecord[]) {
		const roles: { key: string; label: string }[] = [];

		for (const teamMember of teamMembers) {
			const role = normalizeRole(teamMember.role);
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
		const hasNoRole = teamMembers.some((teamMember) => normalizeRole(teamMember.role).length === 0);

		return [
			{ id: 'all', label: 'All roles' },
			...sortedRoles.map((role) => ({ id: `role:${role.key}`, label: role.label })),
			...(hasNoRole ? [{ id: 'no-role', label: 'No role' }] : [])
		];
	}

	function matchesTeamMemberFilters(item: TeamMemberItem) {
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
		notificationWarning = null;
		modalOpen = true;
	}

	function closeModal() {
		if (isAddingTeamMembers) {
			return;
		}

		modalOpen = false;
		modalError = null;
	}

	async function addTeamMembers() {
		if (isAddingTeamMembers) {
			return;
		}

		const parsedInput = parseTeamMemberEmailInput(teamMemberEmails);

		if (parsedInput.error) {
			modalError = parsedInput.error;
			return;
		}

		modalError = null;
		notificationWarning = null;
		isAddingTeamMembers = true;

		try {
			const addResult = await client.action(api.teamMembers.addTeamMembersAndNotify, {
				emails: parsedInput.emails
			});
			notificationWarning =
				addResult.notificationFailedEmails.length > 0
					? 'Team members were added, but some notification emails could not be sent.'
					: null;
			teamMemberEmails = '';
			modalOpen = false;
		} catch (error) {
			modalError = error instanceof Error ? error.message : 'Could not add team members.';
		} finally {
			isAddingTeamMembers = false;
		}
	}

	function isDeletingTeamMember(teamMemberId: Id<'teamMembers'>) {
		return deletingTeamMemberIds.includes(teamMemberId);
	}

	function editTeamMember(teamMember: TeamMemberRecord) {
		actionError = null;
		editingTeamMemberId = teamMember.id;
		teamMemberDraft = {
			name: teamMember.name,
			email: teamMember.email,
			role: teamMember.role
		};
	}

	function closeTeamMemberEditor() {
		editingTeamMemberId = null;
		teamMemberDraft = {
			name: '',
			email: '',
			role: ''
		};
	}

	function updateTeamMemberDraft(patch: Partial<typeof teamMemberDraft>) {
		teamMemberDraft = { ...teamMemberDraft, ...patch };
	}

	async function saveTeamMember(teamMember: TeamMemberRecord) {
		if (savingTeamMemberId) {
			return;
		}

		actionError = null;
		savingTeamMemberId = teamMember.id;

		try {
			await client.mutation(api.teamMembers.updateTeamMember, {
				teamMemberId: teamMember.id,
				name: teamMemberDraft.name,
				email: teamMemberDraft.email,
				role: teamMemberDraft.role
			});
			closeTeamMemberEditor();
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not update team member.';
		} finally {
			savingTeamMemberId = null;
		}
	}

	async function deleteTeamMembers(teamMemberIds: Id<'teamMembers'>[]) {
		const idsToDelete = teamMemberIds.filter((id) => !isDeletingTeamMember(id));

		if (idsToDelete.length === 0) {
			return;
		}

		actionError = null;
		deletingTeamMemberIds = [...deletingTeamMemberIds, ...idsToDelete];

		try {
			await client.mutation(api.teamMembers.deleteTeamMembers, {
				teamMemberIds: idsToDelete
			});
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not delete team members.';
		} finally {
			deletingTeamMemberIds = deletingTeamMemberIds.filter((id) => !idsToDelete.includes(id));
		}
	}

	function toTeamMemberItem(teamMember: TeamMemberRecord): TeamMemberItem {
		const isDeleting = isDeletingTeamMember(teamMember.id);
		const isEditing = editingTeamMemberId === teamMember.id;
		const isSaving = savingTeamMemberId === teamMember.id;
		const isBusy = isDeleting || isSaving;

		return {
			id: teamMember.id,
			email: teamMember.email,
			role: teamMember.role,
			displayName: teamMember.displayName,
			isEditing,
			nameDraft: isEditing ? teamMemberDraft.name : '',
			emailDraft: isEditing ? teamMemberDraft.email : teamMember.email,
			roleDraft: isEditing ? teamMemberDraft.role : teamMember.role,
			deleteLabel: isDeleting ? 'Deleting...' : 'Delete',
			saveLabel: isSaving ? 'Saving...' : 'Save',
			deleteDisabled: isBusy,
			saveDisabled: isBusy,
			onEdit: () => editTeamMember(teamMember),
			onCancel: closeTeamMemberEditor,
			onSave: () => saveTeamMember(teamMember),
			onDelete: () => deleteTeamMembers([teamMember.id]),
			onNameDraftChange: (name) => updateTeamMemberDraft({ name }),
			onEmailDraftChange: (email) => updateTeamMemberDraft({ email }),
			onRoleDraftChange: (role) => updateTeamMemberDraft({ role }),
			selectAriaLabel: `Select ${teamMember.displayName}`,
			actionsAriaLabel: 'Team member actions',
			actions: isEditing
				? undefined
				: [
						{
							label: isDeleting ? 'Deleting...' : 'Delete',
							ariaLabel: `Delete ${teamMember.displayName}`,
							intent: 'destructive',
							disabled: isDeleting,
							onSelect: () => deleteTeamMembers([teamMember.id])
						}
					]
		};
	}
</script>

<ListRoutePage
	toolbar={{
		searchPlaceholder: 'Search team members...',
		searchAriaLabel: 'Search team members',
		searchValue: searchQuery,
		onSearchValueChange: (value) => (searchQuery = value),
		filters: [
			{
				id: 'role',
				label: selectedRoleFilterLabel,
				selectedId: selectedRoleFilter,
				width: 'wide',
				options: roleFilterOptions,
				onSelect: (optionId) => (selectedRoleFilter = optionId)
			}
		],
		actionLabel: 'Add team members',
		onAction: openModal
	}}
	empty={emptyListState}
	noResults={noResultsState}
	status={listStatus}
	{totalRecords}
	{visibleRecords}
	{isQueryActive}
	loadingMessage="Loading team members..."
	errorMessage="Could not load team members."
>
	{#snippet contentHeader()}
		{#if actionError}
			<p class="border-b border-red-100 bg-red-50 px-4 py-2 text-[0.72rem] text-red-700 md:px-5">
				{actionError}
			</p>
		{/if}
		{#if notificationWarning}
			<p class="border-b border-info-100 bg-info-50 px-4 py-2 text-[0.72rem] text-info-700 md:px-5">
				{notificationWarning}
			</p>
		{/if}
	{/snippet}

	<SelectableList
		items={filteredTeamMemberItems}
		selectAllAriaLabel="Select all team members"
		selectedActionsAriaLabel="Selected team member actions"
		selectedActions={[
			{
				label: deletingTeamMemberIds.length > 0 ? 'Deleting...' : 'Delete',
				ariaLabel: 'Delete selected team members',
				intent: 'destructive',
				disabled: deletingTeamMemberIds.length > 0,
				onSelect: (selectedTeamMemberIds) =>
					deleteTeamMembers(selectedTeamMemberIds as Id<'teamMembers'>[])
			}
		]}
		rowActionsAriaLabel="Team member actions"
	>
		{#snippet rowCells(item)}
			<TeamMemberListRow {item} />
		{/snippet}
	</SelectableList>
</ListRoutePage>

<AddTeamMembersModal
	error={modalError}
	isAdding={isAddingTeamMembers}
	open={modalOpen}
	value={teamMemberEmails}
	onClose={closeModal}
	onSubmit={addTeamMembers}
	onValueChange={(value) => (teamMemberEmails = value)}
/>
