<script lang="ts">
	import { EMAIL_ATTACHMENT_FORMAT } from '@overbase/builder-sdk/email';
	import { X } from 'lucide-svelte';

	type Props = {
		filename: string;
		removable?: boolean;
		onRemove?: () => void;
	};

	let { filename, removable = false, onRemove }: Props = $props();
</script>

<div
	class={`inline-flex h-9 max-w-full items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 py-0 pl-2 ${removable ? 'pr-1.5' : 'pr-3'} text-zinc-800`}
>
	<div
		class="relative flex h-6 w-5 shrink-0 items-end justify-center rounded-sm border border-emerald-200 bg-white"
		aria-label={EMAIL_ATTACHMENT_FORMAT.label}
	>
		<div
			class="absolute top-0 right-0 h-1.5 w-1.5 border-b border-l border-emerald-100 bg-zinc-50"
		></div>
		<div
			class="mb-1 rounded-[2px] bg-emerald-700/70 px-0.5 py-px text-[0.34rem] leading-none font-semibold text-white"
		>
			{EMAIL_ATTACHMENT_FORMAT.shortLabel}
		</div>
	</div>

	<div class="min-w-0">
		<p class="truncate text-[0.72rem] leading-tight font-medium text-zinc-800">{filename}</p>
	</div>

	{#if removable}
		<button
			type="button"
			aria-label={`Remove ${filename}`}
			class="ml-1 inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
			onclick={onRemove}
		>
			<X class="size-3.25 stroke-[2.1]" />
		</button>
	{/if}
</div>
