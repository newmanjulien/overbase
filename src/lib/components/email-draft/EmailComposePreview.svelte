<script lang="ts">
	import type { EmailBodyBlock, EmailDraft } from '@overbase/builder-sdk/email';
	import EmailComposeDocument from '$lib/components/email-draft/EmailComposeDocument.svelte';
	import { formatRecipients } from '$lib/components/email-draft/email-editable-draft';
	import EmailAttachmentCard from '$lib/components/email-draft/EmailAttachmentCard.svelte';

	type Props = {
		draft: EmailDraft;
		onOpenAttachment?: () => void;
	};

	let { draft, onOpenAttachment }: Props = $props();

	const toLine = $derived(formatRecipients(draft.to));
	const ccLine = $derived(formatRecipients(draft.cc));
	const hasBody = $derived(draft.body.length > 0);

	function isParagraphBlock(block: EmailBodyBlock): block is Extract<EmailBodyBlock, { type: 'paragraph' }> {
		return block.type === 'paragraph';
	}
</script>

<EmailComposeDocument>
	{#snippet to()}
		{#if toLine}
			<p class="truncate text-[0.72rem] text-zinc-800">{toLine}</p>
		{/if}
	{/snippet}

	{#snippet cc()}
		{#if ccLine}
			<p class="truncate text-[0.72rem] text-zinc-800">{ccLine}</p>
		{/if}
	{/snippet}

	{#snippet attachment()}
		{#if draft.attachment}
			<EmailAttachmentCard
				filename={draft.attachment.filename}
				onOpen={onOpenAttachment}
			/>
		{:else}
			<p class="text-[0.72rem] text-zinc-400">No attachment</p>
		{/if}
	{/snippet}

	{#snippet body()}
		<div class={hasBody ? 'text-zinc-900' : 'text-zinc-500'}>
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
	{/snippet}

</EmailComposeDocument>
