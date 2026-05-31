<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from '$lib/ui';
	import BuilderActionBar from './BuilderActionBar.svelte';

	type Props = {
		disabled: boolean;
		label: string;
		error: string | null;
		onPublish: () => void;
		publishPrerequisiteHint?: {
			text: string;
			actionLabel: string;
			onAction: () => void;
		} | null;
		contactAttachmentStatus?: {
			count: number;
			fileName: string;
		} | null;
		onOpenContactAttachment?: () => void;
		secondaryAction?: Snippet;
		mobileOrder?: 'primary-first' | 'secondary-first';
		class?: string;
		buttonClass?: string;
	};

	let {
		disabled,
		label,
		error,
		onPublish,
		publishPrerequisiteHint = null,
		contactAttachmentStatus = null,
		onOpenContactAttachment,
		secondaryAction,
		mobileOrder = 'primary-first',
		class: className = '',
		buttonClass = 'h-10 w-full text-[0.8rem] md:h-8 md:w-auto md:text-[0.74rem]'
	}: Props = $props();

	const contactCountLabel = $derived(
		contactAttachmentStatus?.count === 1
			? '1 contact'
			: `${contactAttachmentStatus?.count ?? 0} contacts`
	);
</script>

{#if error}
	<p class="border-t border-red-100 bg-red-50 px-4 py-2 text-[0.72rem] text-red-700 md:px-7">
		{error}
	</p>
{/if}
{#if publishPrerequisiteHint}
	<div
		class="flex flex-col gap-2 border-t border-stone-100 bg-stone-50 px-4 py-2 text-[0.72rem] leading-relaxed text-stone-700 md:flex-row md:items-center md:justify-between md:px-7"
	>
		<p>{publishPrerequisiteHint.text}</p>
		<button
			type="button"
			class="self-start text-[0.68rem] font-medium text-stone-700 underline underline-offset-2 hover:text-stone-950 md:self-auto"
			onclick={publishPrerequisiteHint.onAction}
		>
			{publishPrerequisiteHint.actionLabel}
		</button>
	</div>
{/if}
{#if contactAttachmentStatus}
	<div
		class="flex flex-col gap-2 border-t border-stone-100 bg-stone-50 px-4 py-2 text-[0.72rem] leading-relaxed text-stone-700 md:flex-row md:items-center md:justify-between md:px-7"
	>
		<p>
			<span class="font-medium">{contactCountLabel}</span> attached from
			<span class="font-medium">{contactAttachmentStatus.fileName}</span>
		</p>
		{#if onOpenContactAttachment}
			<button
				type="button"
				class="self-start text-[0.68rem] font-medium text-stone-700 underline underline-offset-2 hover:text-stone-950 md:self-auto"
				onclick={onOpenContactAttachment}
			>
				Replace
			</button>
		{/if}
	</div>
{/if}
<BuilderActionBar class={className} {mobileOrder}>
	{#snippet secondary()}
		{@render secondaryAction?.()}
	{/snippet}

	{#snippet primary()}
		<Button variant="primary" {disabled} class={buttonClass} onclick={onPublish}>
			{label}
		</Button>
	{/snippet}
</BuilderActionBar>
