<script lang="ts">
	import EmailAttachmentSpreadsheetPreview from '$lib/components/email-draft/EmailAttachmentSpreadsheetPreview.svelte';
	import EmailComposePreview from '$lib/components/email-draft/EmailComposePreview.svelte';
	import OpportunityFormatRulesPanel from './OpportunityFormatRulesPanel.svelte';
	import type { OpportunityFormatDetailState } from './opportunity-format-detail-state.svelte';
	import type { OpportunityFormatDetailLoadState } from './opportunity-format-detail-types';

	type Props = {
		detailState: OpportunityFormatDetailState;
		isAttachmentOpen: boolean;
		loadState: OpportunityFormatDetailLoadState;
		onCloseAttachment: () => void;
		onOpenAttachment: () => void;
		onSaveRules: () => void | Promise<void>;
	};

	let {
		detailState,
		isAttachmentOpen,
		loadState,
		onCloseAttachment,
		onOpenAttachment,
		onSaveRules
	}: Props = $props();
</script>

<div
	class={isAttachmentOpen && detailState.emailDraft.attachment
		? 'h-full min-h-0 bg-white md:hidden'
		: 'min-h-full bg-white px-4 py-4 md:hidden'}
>
	{#if loadState === 'loading'}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-zinc-500">
			Loading format...
		</div>
	{:else if loadState === 'error'}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-red-600">
			Could not load format.
		</div>
	{:else if loadState === 'notFound'}
		<div class="flex min-h-60 items-center justify-center text-[0.74rem] text-zinc-500">
			Format not found.
		</div>
	{:else if isAttachmentOpen && detailState.emailDraft.attachment}
		<div class="flex h-full min-h-0 w-full flex-col">
			<EmailAttachmentSpreadsheetPreview
				attachment={detailState.emailDraft.attachment}
				onClose={onCloseAttachment}
			/>
		</div>
	{:else}
		<div class="space-y-5">
			<section>
				<EmailComposePreview
					draft={detailState.emailDraft}
					onOpenAttachment={onOpenAttachment}
				/>
			</section>

			<section class="border-t border-zinc-100 pt-4">
				<OpportunityFormatRulesPanel
					rules={detailState.rulesDraft}
					canSave={detailState.canSaveRules}
					onRulesChange={detailState.updateRules}
					onSave={() => void onSaveRules()}
				/>
			</section>
		</div>
	{/if}
</div>
