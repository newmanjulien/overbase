<script lang="ts">
	import EmailAttachmentCard from '$lib/domain/email-drafts/EmailAttachmentCard.svelte';
	import EmailComposeDocument from '$lib/domain/email-drafts/EmailComposeDocument.svelte';
	import {
		createDefaultBuilderSpreadsheetAttachment,
		normalizeBuilderAttachmentName,
		type BuilderVariableDefinition
	} from '../../../../builders/model';
	import BuilderEmailBodyEditor from './BuilderEmailBodyEditor.svelte';
	import BuilderSpreadsheetAttachmentEditor from './BuilderSpreadsheetAttachmentEditor.svelte';
	import type { BuilderEditorState } from './builder-editor-state.svelte';
	import { BUILDER_VARIABLE_DRAG_MIME } from './builder-variable-drag';

	type Props = {
		editor: BuilderEditorState;
		variables: readonly BuilderVariableDefinition[];
		variableInsertionRequest?: { id: number; fieldId: string } | null;
	};

	let { editor, variables, variableInsertionRequest = null }: Props = $props();
	let handledInsertionRequestId = $state(0);
	let bodyInsertionRequest = $state<{ id: number; fieldId: string } | null>(null);
	let spreadsheetInsertionRequest = $state<{ id: number; fieldId: string } | null>(null);

	$effect(() => {
		const request = variableInsertionRequest;

		if (!request || request.id === handledInsertionRequestId) {
			return;
		}

		handledInsertionRequestId = request.id;

		if (editor.isAttachmentOpen && editor.activeEmailContent.attachment) {
			spreadsheetInsertionRequest = request;
			return;
		}

		bodyInsertionRequest = request;
	});

	function addAttachment() {
		const attachmentName = normalizeBuilderAttachmentName(editor.attachmentInputText);

		if (!attachmentName) {
			return;
		}

		editor.addAttachment(createDefaultBuilderSpreadsheetAttachment(attachmentName));
	}

	function removeAttachment() {
		editor.removeAttachment((filename) => window.confirm(`Delete ${filename}?`));
	}

	function preventVariableDrop(event: DragEvent) {
		if (!event.dataTransfer?.types.includes(BUILDER_VARIABLE_DRAG_MIME)) {
			return;
		}

		event.preventDefault();
	}
</script>

<section
	class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white text-stone-950"
	aria-label="Build format email editor"
	ondrop={preventVariableDrop}
>
	<div
		class={editor.isAttachmentOpen && editor.activeEmailContent.attachment
			? 'min-h-0 flex-1 overflow-hidden'
			: 'min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5'}
	>
		{#if editor.isAttachmentOpen && editor.activeEmailContent.attachment}
			<div class="flex h-full min-h-0 w-full flex-col">
				<BuilderSpreadsheetAttachmentEditor
					attachment={editor.activeEmailContent.attachment}
					{variables}
					variableInsertionRequest={spreadsheetInsertionRequest}
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
						<BuilderEmailBodyEditor
							body={editor.activeEmailContent.body}
							{variables}
							variableInsertionRequest={bodyInsertionRequest}
							onBodyChange={editor.updateBody}
						/>
					{/snippet}
				</EmailComposeDocument>
			</div>
		{/if}
	</div>
</section>
