<script lang="ts">
	import type { EmailBodyBlock, EmailDraft } from '$convex/emailArtifact';
	import { formatRecipients } from '$lib/features/builder-email/email-editable-draft';
	import EmailAttachmentCard from '$lib/features/builder-email/EmailAttachmentCard.svelte';

	type Props = {
		draft: EmailDraft;
	};

	let { draft }: Props = $props();

	const toLine = $derived(formatRecipients(draft.to));
	const ccLine = $derived(formatRecipients(draft.cc));
	const hasBody = $derived(draft.body.length > 0);

	function isParagraphBlock(block: EmailBodyBlock): block is Extract<EmailBodyBlock, { type: 'paragraph' }> {
		return block.type === 'paragraph';
	}
</script>

<div class="flex min-h-8 items-stretch gap-2.5">
	<div
		class="flex h-8 w-12 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white text-[0.68rem] font-medium text-zinc-950"
	>
		To
	</div>
	<div class="flex min-w-0 flex-1 items-center border-b border-zinc-200">
		{#if toLine}
			<p class="truncate text-[0.78rem] text-zinc-800">{toLine}</p>
		{/if}
	</div>
</div>

<div class="mt-3 flex min-h-8 items-stretch gap-2.5">
	<div
		class="flex h-8 w-12 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white text-[0.68rem] font-medium text-zinc-950"
	>
		Cc
	</div>
	<div class="flex min-w-0 flex-1 items-center border-b border-zinc-200">
		{#if ccLine}
			<p class="truncate text-[0.78rem] text-zinc-800">{ccLine}</p>
		{/if}
	</div>
</div>

<div class="mt-5 border-b border-zinc-200 pb-2 text-[0.82rem] leading-snug">
	{#if draft.attachments.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each draft.attachments as attachment, attachmentIndex (`${attachment}:${attachmentIndex}`)}
				<EmailAttachmentCard filename={attachment} />
			{/each}
		</div>
	{:else}
		<p class="text-zinc-500">Attach a PDF</p>
	{/if}
</div>

<div
	class={[
		'min-h-[24rem] flex-1 pt-5 text-[0.82rem] leading-[1.52]',
		hasBody ? 'text-zinc-900' : 'text-zinc-500'
	]}
>
	{#if hasBody}
		<div class="space-y-3.5">
			{#each draft.body as block, blockIndex (`${block.type}:${blockIndex}`)}
				{#if isParagraphBlock(block)}
					<p class="whitespace-pre-wrap">{block.text}</p>
				{:else if block.type === 'bullets'}
					<ul class="list-disc space-y-1.5 pl-5">
						{#each block.items as item, itemIndex (`${item}:${itemIndex}`)}
							<li class="pl-1">{item}</li>
						{/each}
					</ul>
				{:else if block.type === 'link'}
					<p>
						<span
							class="cursor-default font-medium text-blue-600 underline decoration-blue-600/70 underline-offset-2"
							title={block.href}
						>
							{block.label}
						</span>
					</p>
				{/if}
			{/each}
		</div>
	{:else}
		<p>Add email body</p>
	{/if}
</div>
