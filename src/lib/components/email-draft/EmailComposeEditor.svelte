<script lang="ts">
	import {
		addEditableSpreadsheetAttachment,
		removeEditableSpreadsheetAttachment,
		type EditableEmailDraft
	} from '$lib/components/email-draft/email-editable-draft';
	import EmailAttachmentCard from '$lib/components/email-draft/EmailAttachmentCard.svelte';
	import EmailComposeDocument from '$lib/components/email-draft/EmailComposeDocument.svelte';

	type Props = {
		editableDraft: EditableEmailDraft;
		disabled?: boolean;
		onDraftChange: (draft: EditableEmailDraft) => void;
		onOpenAttachment?: () => void;
	};

	let { editableDraft, disabled = false, onDraftChange, onOpenAttachment }: Props = $props();

	function updateDraft(patch: Partial<EditableEmailDraft>) {
		onDraftChange({
			...editableDraft,
			...patch
		});
	}

	function addAttachment() {
		onDraftChange(addEditableSpreadsheetAttachment(editableDraft, editableDraft.attachmentInputText));
	}

	function removeAttachment() {
		if (!editableDraft.attachment || !window.confirm(`Delete ${editableDraft.attachment.filename}?`)) {
			return;
		}

		onDraftChange(removeEditableSpreadsheetAttachment(editableDraft));
	}
</script>

<EmailComposeDocument>
	{#snippet to()}
		<input
			value={editableDraft.toText}
			aria-label="To recipients"
			placeholder="Recipients"
			{disabled}
			class="h-8 min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.72rem] text-zinc-800 outline-none placeholder:text-zinc-400 disabled:cursor-default disabled:opacity-60"
			oninput={(event) => updateDraft({ toText: event.currentTarget.value })}
		/>
	{/snippet}

	{#snippet cc()}
		<input
			value={editableDraft.ccText}
			aria-label="Cc recipients"
			placeholder="Cc recipients"
			{disabled}
			class="h-8 min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.72rem] text-zinc-800 outline-none placeholder:text-zinc-400 disabled:cursor-default disabled:opacity-60"
			oninput={(event) => updateDraft({ ccText: event.currentTarget.value })}
		/>
	{/snippet}

	{#snippet attachment()}
		{#if editableDraft.attachment}
			<EmailAttachmentCard
				filename={editableDraft.attachment.filename}
				removable
				onOpen={onOpenAttachment}
				onRemove={removeAttachment}
			/>
		{:else}
			<input
				value={editableDraft.attachmentInputText}
				aria-label="Spreadsheet attachment"
				placeholder="Attach a spreadsheet"
				{disabled}
				class="h-8 w-full min-w-0 border-0 bg-transparent p-0 text-[0.76rem] text-zinc-950 outline-none placeholder:text-zinc-500 disabled:cursor-default disabled:opacity-60"
				oninput={(event) => updateDraft({ attachmentInputText: event.currentTarget.value })}
				onkeydown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						addAttachment();
					}
				}}
			/>
		{/if}
	{/snippet}

	{#snippet body()}
		<textarea
			value={editableDraft.bodyText}
			aria-label="Email body"
			placeholder="Add email body"
			{disabled}
			class="min-h-72 w-full resize-none border-0 bg-transparent p-0 text-[0.76rem] leading-[1.52] text-zinc-900 outline-none placeholder:text-zinc-500 disabled:cursor-default disabled:opacity-60"
			oninput={(event) => updateDraft({ bodyText: event.currentTarget.value })}
		></textarea>
	{/snippet}

</EmailComposeDocument>
