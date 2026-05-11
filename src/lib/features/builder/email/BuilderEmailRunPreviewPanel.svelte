<script lang="ts">
	import {
		createDefaultEmailDraft,
		type EmailDraft
	} from '@overbase/builder-sdk/email';
	import {
		fromEditableEmailDraft,
		toEditableEmailDraft,
		type EditableEmailDraft
	} from '$lib/features/builder/email/email-editable-draft';
	import EmailComposeEditor from '$lib/features/builder/email/EmailComposeEditor.svelte';
	import EmailComposePreview from '$lib/features/builder/email/EmailComposePreview.svelte';
	import EmailAttachmentSpreadsheetPreview from '$lib/features/builder/email/EmailAttachmentSpreadsheetPreview.svelte';
	import { Button } from '$lib/components/ui';

	type Props = {
		draft: EmailDraft;
		emailDraftVersion: number;
		canEdit?: boolean;
		canPublish?: boolean;
		onSave: (draft: EmailDraft, baseEmailDraftVersion: number) => Promise<void>;
		onPublish: () => Promise<void>;
	};

	let {
		draft,
		emailDraftVersion,
		canEdit = false,
		canPublish = false,
		onSave,
		onPublish
	}: Props = $props();

	let isEditing = $state(false);
	let isSaving = $state(false);
	let isPublishing = $state(false);
	let saveError = $state<string | null>(null);
	let publishError = $state<string | null>(null);
	let editableDraft = $state<EditableEmailDraft>(toEditableEmailDraft(createDefaultEmailDraft()));
	let editingBaseEmailDraftVersion = $state(0);
	let isAttachmentOpen = $state(false);
	const openAttachment = $derived(isEditing ? editableDraft.attachment : draft.attachment);

	function beginEdit() {
		editableDraft = toEditableEmailDraft(draft);
		editingBaseEmailDraftVersion = emailDraftVersion;
		saveError = null;
		publishError = null;
		isEditing = true;
	}

	function cancelEdit() {
		saveError = null;
		isEditing = false;
		isAttachmentOpen = false;
	}

	function showAttachment() {
		isAttachmentOpen = true;
	}

	function closeAttachment() {
		isAttachmentOpen = false;
	}

	function updateOpenAttachment(attachment: NonNullable<EditableEmailDraft['attachment']>) {
		editableDraft = {
			...editableDraft,
			attachment
		};
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

	async function publishDraft() {
		if (isPublishing || !canPublish) {
			return;
		}

		isPublishing = true;
		publishError = null;

		try {
			await onPublish();
		} catch (error) {
			publishError = error instanceof Error ? error.message : 'Could not publish notification.';
		} finally {
			isPublishing = false;
		}
	}
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white text-zinc-950">
	<div
		class={isAttachmentOpen && openAttachment
			? 'min-h-0 flex-1 overflow-hidden'
			: 'min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5'}
	>
		{#if isAttachmentOpen && openAttachment}
			<div class="flex h-full min-h-0 w-full flex-col">
				<EmailAttachmentSpreadsheetPreview
					attachment={openAttachment}
					editable={isEditing}
					disabled={isSaving}
					onAttachmentChange={isEditing ? updateOpenAttachment : undefined}
					onClose={closeAttachment}
				/>
			</div>
		{:else}
			<div class="mx-auto flex min-h-full w-full max-w-[820px] flex-col">
				{#if isEditing}
					<EmailComposeEditor
						{editableDraft}
						disabled={isSaving}
						onDraftChange={(nextDraft) => {
							editableDraft = nextDraft;
						}}
						onOpenAttachment={showAttachment}
					/>
				{:else}
					<EmailComposePreview {draft} onOpenAttachment={showAttachment} />
				{/if}
			</div>
		{/if}
	</div>

	<div class="shrink-0 border-t border-zinc-100 bg-white px-4 py-3 md:px-5">
		{#if saveError}
			<p class="mb-2 text-[0.68rem] leading-snug text-red-600">{saveError}</p>
		{/if}
		{#if publishError}
			<p class="mb-2 text-[0.68rem] leading-snug text-red-600">{publishError}</p>
		{/if}

		<div class="flex items-center justify-end gap-2">
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
					disabled={!canEdit || isPublishing}
					onclick={beginEdit}
				>
					Edit draft
				</Button>
				<Button
					variant="primary"
					class="px-3 text-[0.74rem]"
					disabled={!canPublish || isPublishing}
					onclick={() => void publishDraft()}
				>
					{isPublishing ? 'Publishing...' : 'Publish'}
				</Button>
			{/if}
		</div>
	</div>
</aside>
