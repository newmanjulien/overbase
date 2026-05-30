<script lang="ts">
	import EmailAttachmentCard from '$lib/domain/email-drafts/EmailAttachmentCard.svelte';
	import EmailComposeDocument from '$lib/domain/email-drafts/EmailComposeDocument.svelte';
	import {
		createDefaultBlueprintSpreadsheetAttachment,
		normalizeBlueprintAttachmentName,
		type BlueprintVariableDefinition
	} from '../../../../blueprints/model';
	import BlueprintEmailBodyEditor from './BlueprintEmailBodyEditor.svelte';
	import BlueprintSpreadsheetAttachmentEditor from './BlueprintSpreadsheetAttachmentEditor.svelte';
	import type { BlueprintEditorState } from './blueprint-editor-state.svelte';
	import { BLUEPRINT_VARIABLE_DRAG_MIME } from './blueprint-variable-drag';

	type Props = {
		editor: BlueprintEditorState;
		variables: readonly BlueprintVariableDefinition[];
	};

	let { editor, variables }: Props = $props();

	function addAttachment() {
		const attachmentName = normalizeBlueprintAttachmentName(editor.attachmentInputText);

		if (!attachmentName) {
			return;
		}

		editor.addAttachment(createDefaultBlueprintSpreadsheetAttachment(attachmentName));
	}

	function removeAttachment() {
		editor.removeAttachment((filename) => window.confirm(`Delete ${filename}?`));
	}

	function preventVariableDrop(event: DragEvent) {
		if (!event.dataTransfer?.types.includes(BLUEPRINT_VARIABLE_DRAG_MIME)) {
			return;
		}

		event.preventDefault();
	}
</script>

<section
	class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white text-stone-950"
	aria-label="Blueprint email editor"
	ondrop={preventVariableDrop}
>
	<div
		class={editor.isAttachmentOpen && editor.activeEmailContent.attachment
			? 'min-h-0 flex-1 overflow-hidden'
			: 'min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5'}
	>
		{#if editor.isAttachmentOpen && editor.activeEmailContent.attachment}
			<div class="flex h-full min-h-0 w-full flex-col">
				<BlueprintSpreadsheetAttachmentEditor
					attachment={editor.activeEmailContent.attachment}
					{variables}
					onAttachmentChange={editor.setOpenAttachment}
					onClose={editor.closeAttachment}
				/>
			</div>
		{:else}
			<div class="mx-auto flex min-h-full w-full max-w-[820px] flex-col">
				<EmailComposeDocument>
					{#snippet to()}
						<input
							value={editor.toInputText}
							aria-label="To recipients"
							placeholder="Add recipients"
							class="min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.79rem] text-stone-800 outline-none placeholder:text-stone-400"
							onfocus={() => {
								editor.isEditingTo = true;
							}}
							oninput={(event) => {
								editor.setRecipientInput('to', event.currentTarget.value);
							}}
							onblur={(event) => editor.commitRecipientInput('to', event.currentTarget.value)}
							ondrop={preventVariableDrop}
						/>
					{/snippet}

					{#snippet cc()}
						<input
							value={editor.ccInputText}
							aria-label="Cc recipients"
							placeholder="Add Cc recipients"
							class="min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.79rem] text-stone-800 outline-none placeholder:text-stone-400"
							onfocus={() => {
								editor.isEditingCc = true;
							}}
							oninput={(event) => {
								editor.setRecipientInput('cc', event.currentTarget.value);
							}}
							onblur={(event) => editor.commitRecipientInput('cc', event.currentTarget.value)}
							ondrop={preventVariableDrop}
						/>
					{/snippet}

					{#snippet attachment()}
						{#if editor.activeEmailContent.attachment}
							<EmailAttachmentCard
								filename={editor.activeEmailContent.attachment.filename}
								removable
								onOpen={editor.openAttachment}
								onRemove={removeAttachment}
							/>
						{:else}
							<input
								value={editor.attachmentInputText}
								aria-label="Spreadsheet attachment"
								placeholder="Attach a spreadsheet"
								class="w-full min-w-0 border-0 bg-transparent p-0 text-[0.79rem] text-stone-800 outline-none placeholder:text-stone-400"
								oninput={(event) => {
									editor.updateAttachmentInput(event.currentTarget.value);
								}}
								onkeydown={(event) => {
									if (event.key === 'Enter') {
										event.preventDefault();
										addAttachment();
									}
								}}
								ondrop={preventVariableDrop}
							/>
						{/if}
					{/snippet}

					{#snippet body()}
						<BlueprintEmailBodyEditor
							body={editor.activeEmailContent.body}
							{variables}
							onBodyChange={editor.updateBody}
						/>
					{/snippet}
				</EmailComposeDocument>
			</div>
		{/if}
	</div>
</section>
