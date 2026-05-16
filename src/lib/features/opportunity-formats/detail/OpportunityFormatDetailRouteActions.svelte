<script lang="ts">
	import Pause from 'phosphor-svelte/lib/Pause';
	import Play from 'phosphor-svelte/lib/Play';
	import { AvatarTeamPicker } from '$lib/components/people';
	import { Button } from '$lib/components/ui';

	type TeamPickerPerson = {
		id: string;
		name: string;
		avatar: string;
	};

	type Props = {
		canToggleStatus: boolean;
		detailViewActionLabel: string;
		people: TeamPickerPerson[];
		selectedTeamMemberIds: string[];
		status: 'active' | 'paused';
		onSelectedTeamMemberIdsChange: (nextIds: string[]) => void | Promise<void>;
		onToggleDetailView: () => void;
		onToggleStatus: () => void | Promise<void>;
	};

	let {
		canToggleStatus,
		detailViewActionLabel,
		people,
		selectedTeamMemberIds,
		status,
		onSelectedTeamMemberIdsChange,
		onToggleDetailView,
		onToggleStatus
	}: Props = $props();
</script>

<div class="flex items-center gap-2">
	<Button
		variant="secondary"
		class="h-7 px-2.5 text-[0.68rem]"
		disabled={!canToggleStatus}
		onclick={() => void onToggleStatus()}
	>
		{#snippet leading()}
			{#if status === 'active'}
				<Play size={14} weight="regular" />
			{:else}
				<Pause size={14} weight="regular" />
			{/if}
		{/snippet}
		{status === 'active' ? 'Active' : 'Paused'}
	</Button>
	<AvatarTeamPicker
		{people}
		selectedIds={selectedTeamMemberIds}
		minSelected={1}
		onSelectedIdsChange={(nextIds) => void onSelectedTeamMemberIdsChange(nextIds)}
		altBase="Format teammate"
		ariaLabel="Manage team members"
		searchPlaceholder="Search team..."
		emptyLabel="No team members found"
	/>
	<Button variant="secondary" class="h-7 px-2.5 text-[0.68rem]" onclick={onToggleDetailView}>
		{detailViewActionLabel}
	</Button>
</div>
