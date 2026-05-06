<script lang="ts">
	import {
		addEditableAttachment,
		removeEditableAttachment,
		type EditableEmailDraft
	} from '$lib/features/builder-email/email-editable-draft';
	import EmailAttachmentCard from '$lib/features/builder-email/EmailAttachmentCard.svelte';

	type Props = {
		editableDraft: EditableEmailDraft;
		disabled?: boolean;
		onDraftChange: (draft: EditableEmailDraft) => void;
	};

	let { editableDraft, disabled = false, onDraftChange }: Props = $props();

	function updateDraft(patch: Partial<EditableEmailDraft>) {
		onDraftChange({
			...editableDraft,
			...patch
		});
	}

	function addAttachment() {
		onDraftChange(addEditableAttachment(editableDraft, editableDraft.attachmentInputText));
	}
</script>

<div class="flex min-h-8 items-stretch gap-2.5">
	<div
		class="flex h-8 w-12 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white text-[0.68rem] font-medium text-zinc-950"
	>
		To
	</div>
	<div class="flex min-w-0 flex-1 items-center border-b border-zinc-200">
		<input
			value={editableDraft.toText}
			aria-label="To recipients"
			placeholder="Recipients"
			{disabled}
			class="h-8 min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.78rem] text-zinc-800 outline-none placeholder:text-zinc-400 disabled:cursor-default disabled:opacity-60"
			oninput={(event) => updateDraft({ toText: event.currentTarget.value })}
		/>
	</div>
</div>

<div class="mt-3 flex min-h-8 items-stretch gap-2.5">
	<div
		class="flex h-8 w-12 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white text-[0.68rem] font-medium text-zinc-950"
	>
		Cc
	</div>
	<div class="flex min-w-0 flex-1 items-center border-b border-zinc-200">
		<input
			value={editableDraft.ccText}
			aria-label="Cc recipients"
			placeholder="Cc recipients"
			{disabled}
			class="h-8 min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.78rem] text-zinc-800 outline-none placeholder:text-zinc-400 disabled:cursor-default disabled:opacity-60"
			oninput={(event) => updateDraft({ ccText: event.currentTarget.value })}
		/>
	</div>
</div>

<div class="mt-5 border-b border-zinc-200 pb-2 text-[0.82rem] leading-snug">
	<input
		value={editableDraft.attachmentInputText}
		aria-label="PDF attachment"
		placeholder="Attach a PDF"
		{disabled}
		class="h-8 w-full min-w-0 border-0 bg-transparent p-0 text-[0.82rem] text-zinc-950 outline-none placeholder:text-zinc-500 disabled:cursor-default disabled:opacity-60"
		oninput={(event) => updateDraft({ attachmentInputText: event.currentTarget.value })}
		onkeydown={(event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				addAttachment();
			}
		}}
	/>

	{#if editableDraft.attachments.length > 0}
		<div class="mt-2 flex flex-wrap gap-2">
			{#each editableDraft.attachments as attachment, attachmentIndex (`${attachment}:${attachmentIndex}`)}
				<EmailAttachmentCard
					filename={attachment}
					removable
					onRemove={() => onDraftChange(removeEditableAttachment(editableDraft, attachmentIndex))}
				/>
			{/each}
		</div>
	{/if}
</div>

<div class="min-h-[24rem] flex-1 pt-5 text-[0.82rem] leading-[1.52] text-zinc-900">
	<textarea
		value={editableDraft.bodyText}
		aria-label="Email body"
		placeholder="Add email body"
		{disabled}
		class="min-h-[22rem] w-full resize-none border-0 bg-transparent p-0 text-[0.82rem] leading-[1.52] text-zinc-900 outline-none placeholder:text-zinc-500 disabled:cursor-default disabled:opacity-60"
		oninput={(event) => updateDraft({ bodyText: event.currentTarget.value })}
	></textarea>
</div>

<div class="mt-5 rounded-sm border border-zinc-200 bg-zinc-50/50 px-3 py-2.5">
	<textarea
		id="email-fire-reason"
		value={editableDraft.fireReasonText}
		aria-label="Why this email fires"
		placeholder="Describe the trigger rule"
		{disabled}
		class="min-h-16 w-full resize-none border-0 bg-transparent p-0 text-[0.76rem] leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-400 disabled:cursor-default disabled:opacity-60"
		oninput={(event) => updateDraft({ fireReasonText: event.currentTarget.value })}
	></textarea>
</div>
