<script lang="ts">
	import PauseIcon from 'phosphor-svelte/lib/PauseIcon';
	import PlayIcon from 'phosphor-svelte/lib/PlayIcon';
	import { AvatarPersonPicker } from '$lib/domain/people';
	import { Button } from '$lib/ui';
	import type { EmailFormatRecipientRef } from './email-format-detail-types';
	import { getFormatRecipientKey } from './email-format-detail-types';

	type RecipientPickerPerson = {
		id: string;
		ref: EmailFormatRecipientRef;
		name: string;
		avatarUrl: string;
	};

	type Props = {
		canToggleStatus: boolean;
		detailViewActionLabel: string;
		people: RecipientPickerPerson[];
		selectedRecipientRefs: EmailFormatRecipientRef[];
		status: 'active' | 'paused';
		onSelectedRecipientRefsChange: (nextRefs: EmailFormatRecipientRef[]) => void | Promise<void>;
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
				<PlayIcon size={14} weight="regular" />
			{:else}
				<PauseIcon size={14} weight="regular" />
			{/if}
		{/snippet}
		{status === 'active' ? 'Active' : 'Paused'}
	</Button>
	<AvatarPersonPicker
		{people}
		selectedIds={selectedRecipientIds}
		minSelected={1}
		onSelectedIdsChange={handleSelectedRecipientIdsChange}
		altBase="Email format recipient"
		ariaLabel="Manage recipients"
		searchPlaceholder="Search recipients..."
		emptyLabel="No recipients found"
	/>
	<Button variant="secondary" class="h-7 px-2.5 text-[0.68rem]" onclick={onToggleDetailView}>
		{detailViewActionLabel}
	</Button>
</div>
