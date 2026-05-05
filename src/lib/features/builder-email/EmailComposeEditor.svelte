<script lang="ts">
	import type { EditableEmailDraft } from '$lib/features/builder-email/email-editable-draft';

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

<div class="mt-5 flex min-h-8.5 items-center border-b border-zinc-200 text-[0.82rem] leading-snug">
	<input
		value={editableDraft.subjectText}
		aria-label="Email subject"
		placeholder="Add a subject"
		{disabled}
		class="h-8 min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.82rem] font-medium text-zinc-950 outline-none placeholder:font-normal placeholder:text-zinc-500 disabled:cursor-default disabled:opacity-60"
		oninput={(event) => updateDraft({ subjectText: event.currentTarget.value })}
	/>
</div>

<div class="min-h-[24rem] flex-1 pt-5 text-[0.82rem] leading-[1.52] text-zinc-900">
	<textarea
		value={editableDraft.bodyText}
		aria-label="Email body"
		placeholder="Type / to insert files and more"
		{disabled}
		class="min-h-[22rem] w-full resize-none border-0 bg-transparent p-0 text-[0.82rem] leading-[1.52] text-zinc-900 outline-none placeholder:text-zinc-500 disabled:cursor-default disabled:opacity-60"
		oninput={(event) => updateDraft({ bodyText: event.currentTarget.value })}
	></textarea>
</div>
