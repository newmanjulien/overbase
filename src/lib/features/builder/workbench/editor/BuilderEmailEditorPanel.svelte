<script lang="ts">
	import EmailAttachmentCard from '$lib/domain/email-drafts/EmailAttachmentCard.svelte';
	import EmailComposeDocument from '$lib/domain/email-drafts/EmailComposeDocument.svelte';
	import {
		createDefaultBuilderSpreadsheetAttachment,
		normalizeBuilderAttachmentName,
		type BuilderVariableDefinition
	} from '$lib/features/builder/domain';
	import BuilderEmailBodyEditor from './BuilderEmailBodyEditor.svelte';
	import BuilderSpreadsheetAttachmentEditor from './BuilderSpreadsheetAttachmentEditor.svelte';
	import type { BuilderEditorState } from '../state/builder-editor-state.svelte';
	import type { BuilderVariableInsertionRequest } from '../state/builder-workbench-state.svelte';
	import type { BuilderVariableDragCoordinator } from '../variables/builder-variable-drag-coordinator.svelte';

	type Props = {
		editor: BuilderEditorState;
		variables: readonly BuilderVariableDefinition[];
		dragCoordinator: BuilderVariableDragCoordinator;
		readOnly?: boolean;
		variableInsertionRequest?: BuilderVariableInsertionRequest | null;
		onVariableInsertionRequestHandled?: (requestId: number) => void;
	};

	let {
		editor,
		variables,
		dragCoordinator,
		readOnly = false,
		variableInsertionRequest = null,
		onVariableInsertionRequestHandled
	}: Props = $props();
	const bodyInsertionRequest = $derived(
		variableInsertionRequest?.target === 'body' ? variableInsertionRequest : null
	);
	const spreadsheetInsertionRequest = $derived(
		variableInsertionRequest?.target === 'spreadsheet' ? variableInsertionRequest : null
	);

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

	function formatRecipients(recipients: readonly string[]) {
		return recipients.join(', ');
	}
</script>

<section
	class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white text-stone-950"
	aria-label="Build format email editor"
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
					{dragCoordinator}
					disabled={readOnly}
					variableInsertionRequest={spreadsheetInsertionRequest}
					{onVariableInsertionRequestHandled}
					onAttachmentChange={editor.setOpenAttachment}
					onClose={editor.closeAttachment}
				/>
			</div>
		{:else}
			<div class="mx-auto flex min-h-full w-full max-w-[820px] flex-col">
				<EmailComposeDocument>
					{#snippet to()}
						{#if readOnly}
							<p class="min-w-0 flex-1 truncate text-[0.79rem] text-stone-800">
								{formatRecipients(editor.activeEmailContent.to)}
							</p>
						{:else}
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
							/>
						{/if}
					{/snippet}

					{#snippet cc()}
						{#if readOnly}
							<p class="min-w-0 flex-1 truncate text-[0.79rem] text-stone-800">
								{formatRecipients(editor.activeEmailContent.cc)}
							</p>
						{:else}
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
							/>
						{/if}
					{/snippet}

					{#snippet attachment()}
						{#if editor.activeEmailContent.attachment}
							<EmailAttachmentCard
								filename={editor.activeEmailContent.attachment.filename}
								removable={!readOnly}
								onOpen={editor.openAttachment}
								onRemove={readOnly ? undefined : removeAttachment}
							/>
						{:else if readOnly}
							<p class="min-w-0 text-[0.79rem] text-stone-400">No attachment</p>
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
							/>
						{/if}
					{/snippet}

					{#snippet body()}
						<BuilderEmailBodyEditor
							body={editor.activeEmailContent.body}
							{variables}
							{dragCoordinator}
							disabled={readOnly}
							variableInsertionRequest={bodyInsertionRequest}
							{onVariableInsertionRequestHandled}
							onBodyChange={editor.updateBody}
						/>
					{/snippet}
				</EmailComposeDocument>
			</div>
		{/if}
	</div>
</section>
