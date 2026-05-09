<script lang="ts">
	import { createDefaultEmailDraft, type EmailDraft } from '@overbase/builder-sdk/email';
	import {
		fromEditableEmailDraft,
		toEditableEmailDraft,
		type EditableEmailDraft
	} from '$lib/features/builder/email/email-editable-draft';
	import EmailComposeEditor from '$lib/features/builder/email/EmailComposeEditor.svelte';
	import EmailComposePreview from '$lib/features/builder/email/EmailComposePreview.svelte';
	import { Button } from '$lib/components/ui';

	type Props = {
		draft: EmailDraft;
		emailDraftVersion: number;
		canEdit?: boolean;
		onSave: (draft: EmailDraft, baseEmailDraftVersion: number) => Promise<void>;
	};

	let { draft, emailDraftVersion, canEdit = true, onSave }: Props = $props();

	let isEditing = $state(false);
	let isSaving = $state(false);
	let saveError = $state<string | null>(null);
	let editableDraft = $state<EditableEmailDraft>(toEditableEmailDraft(createDefaultEmailDraft()));
	let editingBaseEmailDraftVersion = $state(0);

	function beginEdit() {
		editableDraft = toEditableEmailDraft(draft);
		editingBaseEmailDraftVersion = emailDraftVersion;
		saveError = null;
		isEditing = true;
	}

	function cancelEdit() {
		saveError = null;
		isEditing = false;
	}

	async function saveDraft() {
		if (isSaving) {
			return;
		}

		isSaving = true;
		saveError = null;

	try {
			await onSave(fromEditableEmailDraft(editableDraft), editingBaseEmailDraftVersion);
			isEditing = false;
		} catch (error) {
			saveError = error instanceof Error ? error.message : 'Could not save draft edits.';
		} finally {
			isSaving = false;
		}
	}
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white text-zinc-950">
	<div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
		<div class="mx-auto flex min-h-full w-full max-w-[820px] flex-col">
			{#if isEditing}
				<EmailComposeEditor
					{editableDraft}
					disabled={isSaving}
					onDraftChange={(nextDraft) => {
						editableDraft = nextDraft;
					}}
				/>
			{:else}
				<EmailComposePreview {draft} />
			{/if}
		</div>
	</div>

	<div class="shrink-0 border-t border-zinc-100 bg-white px-4 py-3 md:px-5">
		{#if saveError}
			<p class="mb-2 text-[0.72rem] leading-snug text-red-600">{saveError}</p>
		{/if}

		<div class="flex justify-end gap-2">
			{#if isEditing}
				<Button
					variant="secondary"
					class="px-3 text-[0.74rem] text-zinc-700"
					disabled={isSaving}
					onclick={cancelEdit}
				>
					Cancel
				</Button>
				<Button
					variant="primary"
					class="px-3 text-[0.74rem]"
					disabled={isSaving}
					onclick={() => void saveDraft()}
				>
					{isSaving ? 'Saving...' : 'Save changes'}
				</Button>
			{:else}
				<Button
					variant="secondary"
					class="px-3 text-[0.74rem] text-zinc-800"
					disabled={!canEdit}
					onclick={beginEdit}
				>
					Edit draft
				</Button>
			{/if}
		</div>
	</div>
</aside>
