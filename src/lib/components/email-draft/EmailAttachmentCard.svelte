<script lang="ts">
	import { EMAIL_ATTACHMENT_FORMAT } from '@overbase/builder-sdk/email';
	import XIcon from 'phosphor-svelte/lib/XIcon';

	type Props = {
		filename: string;
		removable?: boolean;
		onOpen?: () => void;
		onRemove?: () => void;
	};

	let { filename, removable = false, onOpen, onRemove }: Props = $props();

	const isOpenable = $derived(Boolean(onOpen));

	function handleRemove(event: MouseEvent) {
		event.stopPropagation();
		onRemove?.();
	}
</script>

{#snippet attachmentFileContent()}
	<div
		class="relative flex h-6 w-5 shrink-0 items-end justify-center rounded-sm border border-emerald-200 bg-white"
		aria-label={EMAIL_ATTACHMENT_FORMAT.label}
	>
		<div
			class="absolute top-0 right-0 h-1.5 w-1.5 border-b border-l border-emerald-100 bg-zinc-50"
		></div>
		<div
			class="mb-1 rounded-[2px] bg-emerald-700/70 px-0.5 py-px text-[0.32rem] leading-none font-semibold text-white"
		>
			{EMAIL_ATTACHMENT_FORMAT.shortLabel}
		</div>
	</div>

	<div class="min-w-0">
		<p class="truncate text-[0.68rem] leading-tight font-medium text-zinc-800">{filename}</p>
	</div>
{/snippet}

{#snippet removeButton()}
	{#if removable}
		<button
			type="button"
			aria-label={`Remove ${filename}`}
			class="ml-1 inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
			onclick={handleRemove}
		>
			<XIcon size={13} weight="regular" />
		</button>
	{/if}
{/snippet}

{#if isOpenable}
	{#if removable}
		<div
			class="inline-flex h-9 max-w-full items-center rounded-sm border border-zinc-200 bg-zinc-50 pr-1.5 text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-100/70"
		>
			<button
				type="button"
				aria-label={`Open ${filename}`}
				class="flex h-full min-w-0 cursor-pointer items-center gap-2 rounded-sm py-0 pr-1 pl-2 text-left focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:outline-none"
				onclick={onOpen}
			>
				{@render attachmentFileContent()}
			</button>
			{@render removeButton()}
		</div>
	{:else}
		<button
			type="button"
			aria-label={`Open ${filename}`}
			class="inline-flex h-9 max-w-full cursor-pointer items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 py-0 pr-3 pl-2 text-left text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-100/70 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:outline-none"
			onclick={onOpen}
		>
			{@render attachmentFileContent()}
		</button>
	{/if}
{:else}
	<div
		class={`inline-flex h-9 max-w-full items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 py-0 pl-2 ${removable ? 'pr-1.5' : 'pr-3'} text-zinc-800`}
	>
		{@render attachmentFileContent()}
		{@render removeButton()}
	</div>
{/if}
