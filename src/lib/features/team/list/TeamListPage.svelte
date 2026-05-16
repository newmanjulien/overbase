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
	import AddTeamMembersModal from './AddTeamMembersModal.svelte';
	import TeamMemberListRow, { type TeamMemberItem } from './TeamMemberListRow.svelte';
	import { parseTeamEmailInput } from './team-email-input';

	const client = useConvexClient();
	const teamMembersQuery = useQuery(api.teamMembers.listTeamMembers);
	let modalOpen = $state(false);
	let teamEmails = $state('');
	let modalError = $state<string | null>(null);
	let isAddingTeamMembers = $state(false);
	let deletingTeamMemberIds = $state<Id<'teamMembers'>[]>([]);
	let actionError = $state<string | null>(null);
	let editingTeamMemberId = $state<Id<'teamMembers'> | null>(null);
	let savingTeamMemberId = $state<Id<'teamMembers'> | null>(null);
	let teamMemberDraft = $state({
		name: '',
		email: ''
	});
	const teamMemberItems = $derived((teamMembersQuery.data ?? []).map(toTeamMemberItem));
	const listState = $derived(
		teamMembersQuery.isLoading
			? 'loading'
			: teamMembersQuery.error
				? 'error'
				: teamMemberItems.length === 0
					? 'empty'
					: 'ready'
	);

	type TeamMemberRecord = NonNullable<typeof teamMembersQuery.data>[number];

	function openModal() {
		modalError = null;
		modalOpen = true;
	}

	function closeModal() {
		if (isAddingTeamMembers) {
			return;
		}

		modalOpen = false;
		modalError = null;
	}

	function updateTeamEmails(value: string) {
		teamEmails = value;
	}

	async function addTeamMembers() {
		if (isAddingTeamMembers) {
			return;
		}

		const result = parseTeamEmailInput(teamEmails);

		if (result.error) {
			modalError = result.error;
			return;
		}

		modalError = null;
		isAddingTeamMembers = true;

		try {
			await client.mutation(api.teamMembers.addTeamMembers, {
				emails: result.emails
			});
			teamEmails = '';
			modalOpen = false;
		} catch (error) {
			modalError = error instanceof Error ? error.message : 'Could not add teammates.';
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
			email: teamMember.email
		};
	}

	function closeTeamMemberEditor() {
		editingTeamMemberId = null;
		teamMemberDraft = {
			name: '',
			email: ''
		};
	}

	function updateTeamMemberNameDraft(name: string) {
		teamMemberDraft = {
			...teamMemberDraft,
			name
		};
	}

	function updateTeamMemberEmailDraft(email: string) {
		teamMemberDraft = {
			...teamMemberDraft,
			email
		};
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
				email: teamMemberDraft.email
			});
			closeTeamMemberEditor();
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Could not update teammate.';
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
			actionError = error instanceof Error ? error.message : 'Could not delete teammates.';
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
			displayName: teamMember.displayName,
			isEditing,
			nameDraft: isEditing ? teamMemberDraft.name : '',
			emailDraft: isEditing ? teamMemberDraft.email : teamMember.email,
			deleteLabel: isDeleting ? 'Deleting...' : 'Delete',
			saveLabel: isSaving ? 'Saving...' : 'Save',
			deleteDisabled: isBusy,
			saveDisabled: isBusy,
			onEdit: () => editTeamMember(teamMember),
			onCancel: closeTeamMemberEditor,
			onSave: () => saveTeamMember(teamMember),
			onDelete: () => deleteTeamMembers([teamMember.id]),
			onNameDraftChange: updateTeamMemberNameDraft,
			onEmailDraftChange: updateTeamMemberEmailDraft,
			selectAriaLabel: `Select ${teamMember.displayName}`,
			actionsAriaLabel: 'Teammate actions',
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
		searchPlaceholder: 'Search team...',
		searchAriaLabel: 'Search team',
		filterLabel: 'All roles',
		actionLabel: 'Add team',
		onAction: openModal
	}}
	empty={{
		icon: APP_ROUTE_REGISTRY.team.icon,
		title: 'No teammates found',
		description: [
			{ kind: 'text', text: 'Add teammates and we ' },
			{
				kind: 'tooltip',
				label: "won't contact them",
				tooltipText:
					"We won't contact teammates after you add them. They'll only receive emails after you add them to an active opportunity format"
			},
			{ kind: 'text', text: 'until you add them to opportunities' }
		],
		nextSteps:
			'Teammates are the people inside your organization who receive opportunities. Add teammates here, then add them to the right formats',
		actionLabel: 'Add team',
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
		<SelectableList
			items={teamMemberItems}
			selectAllAriaLabel="Select all teammates"
			selectedActionsAriaLabel="Selected teammate actions"
			selectedActions={[
				{
					label: deletingTeamMemberIds.length > 0 ? 'Deleting...' : 'Delete',
					ariaLabel: 'Delete selected teammates',
					intent: 'destructive',
					disabled: deletingTeamMemberIds.length > 0,
					onSelect: (selectedTeamMemberIds) =>
						deleteTeamMembers(selectedTeamMemberIds as Id<'teamMembers'>[])
				}
			]}
			rowActionsAriaLabel="Teammate actions"
		>
			{#snippet rowCells(item)}
				<TeamMemberListRow {item} />
			{/snippet}
		</SelectableList>
	{/if}
</ListRoutePage>

<AddTeamMembersModal
	error={modalError}
	isAdding={isAddingTeamMembers}
	open={modalOpen}
	value={teamEmails}
	onClose={closeModal}
	onSubmit={addTeamMembers}
	onValueChange={updateTeamEmails}
/>
