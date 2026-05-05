<script lang="ts">
	import { api } from '$convex/_generated/api';
	import type { Id } from '$convex/_generated/dataModel';
	import {
		createDefaultEmailDraft,
		type EmailBodyBlock,
		type EmailDraft
	} from '$convex/builderEmailContract';
	import { useQuery } from 'convex-svelte';

	type Props = {
		builderSessionId: Id<'builderSessions'> | null;
	};

	let { builderSessionId }: Props = $props();

	const artifactQuery = useQuery(api.builderSessions.getSessionArtifact, () =>
		builderSessionId ? { builderSessionId } : 'skip'
	);
	const artifact = $derived(artifactQuery.data ?? null);
	const hasArtifactResponse = $derived(artifactQuery.data !== undefined);
	const draft = $derived((artifact?.emailDraft as EmailDraft | undefined) ?? createDefaultEmailDraft());
	const toLine = $derived(formatRecipients(draft.to));
	const ccLine = $derived(formatRecipients(draft.cc));
	const hasBody = $derived(draft.body.length > 0);

	function formatRecipients(recipients: string[]) {
		return recipients.join('; ');
	}

	function isParagraphBlock(block: EmailBodyBlock): block is Extract<EmailBodyBlock, { type: 'paragraph' }> {
		return block.type === 'paragraph';
	}
</script>

<aside class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white text-zinc-950">
	<div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
		<div class="mx-auto flex min-h-full w-full max-w-[820px] flex-col">
			{#if artifactQuery.error}
				<div class="rounded-sm border border-red-200 bg-red-50 p-3 text-[0.76rem] leading-relaxed text-red-700">
					<p class="font-medium">Email preview could not load.</p>
					<p class="mt-1 text-red-600">{artifactQuery.error.message}</p>
				</div>
			{:else if builderSessionId && !hasArtifactResponse}
				<div class="text-[0.76rem] text-zinc-500">Loading email preview...</div>
			{:else if builderSessionId && artifact === null}
				<div class="rounded-sm border border-zinc-200 bg-zinc-50 p-3 text-[0.76rem] leading-relaxed text-zinc-600">
					<p class="font-medium text-zinc-800">Email preview unavailable.</p>
					<p class="mt-1">This builder session no longer has an active preview artifact.</p>
				</div>
			{:else}
			<div class="flex min-h-8 items-stretch gap-2.5">
				<div
					class="flex h-8 w-12 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white text-[0.68rem] font-semibold text-zinc-950"
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
					class="flex h-8 w-12 shrink-0 items-center justify-center rounded-sm border border-zinc-200 bg-white text-[0.68rem] font-semibold text-zinc-950"
				>
					Cc
				</div>
				<div class="flex min-w-0 flex-1 items-center border-b border-zinc-200">
					{#if ccLine}
						<p class="truncate text-[0.78rem] text-zinc-800">{ccLine}</p>
					{/if}
				</div>
			</div>

			<div
				class={[
					'mt-5 flex min-h-8.5 items-center border-b border-zinc-200 text-[0.82rem] leading-snug',
					draft.subject ? 'font-medium text-zinc-950' : 'font-normal text-zinc-500'
				]}
			>
				{draft.subject || 'Add a subject'}
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
					<p>Type / to insert files and more</p>
				{/if}
			</div>
			{/if}
		</div>
	</div>
</aside>
