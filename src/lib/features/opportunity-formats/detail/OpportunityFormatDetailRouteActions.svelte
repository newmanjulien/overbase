<script lang="ts">
	import Pause from 'phosphor-svelte/lib/Pause';
	import Play from 'phosphor-svelte/lib/Play';
	import { AvatarPersonPicker } from '$lib/components/people';
	import { Button } from '$lib/components/ui';
	import type { FormatRecipientRef } from './opportunity-format-detail-types';
	import { getFormatRecipientKey } from './opportunity-format-detail-types';

	type RecipientPickerPerson = {
		id: string;
		ref: FormatRecipientRef;
		name: string;
		avatar: string;
	};

	type Props = {
		canToggleStatus: boolean;
		detailViewActionLabel: string;
		people: RecipientPickerPerson[];
		selectedRecipientRefs: FormatRecipientRef[];
		status: 'active' | 'paused';
		onSelectedRecipientRefsChange: (nextRefs: FormatRecipientRef[]) => void | Promise<void>;
		onToggleDetailView: () => void;
		onToggleStatus: () => void | Promise<void>;
	};

	let {
		canToggleStatus,
		detailViewActionLabel,
		people,
		selectedRecipientRefs,
		status,
		onSelectedRecipientRefsChange,
		onToggleDetailView,
		onToggleStatus
	}: Props = $props();

	const selectedRecipientIds = $derived(selectedRecipientRefs.map(getFormatRecipientKey));

	function handleSelectedRecipientIdsChange(nextIds: string[]) {
		const peopleById = new Map(people.map((person) => [person.id, person]));
		const nextRefs = nextIds.flatMap((id) => {
			const person = peopleById.get(id);

			return person ? [person.ref] : [];
		});

		void onSelectedRecipientRefsChange(nextRefs);
	}
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
	<AvatarPersonPicker
		{people}
		selectedIds={selectedRecipientIds}
		minSelected={1}
		onSelectedIdsChange={handleSelectedRecipientIdsChange}
		altBase="Format recipient"
		ariaLabel="Manage recipients"
		searchPlaceholder="Search recipients..."
		emptyLabel="No recipients found"
	/>
	<Button variant="secondary" class="h-7 px-2.5 text-[0.68rem]" onclick={onToggleDetailView}>
		{detailViewActionLabel}
	</Button>
</div>
