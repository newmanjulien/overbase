<script lang="ts">
	import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import { cn } from '$lib/ui/cn';
	import InlineText from '$lib/ui/InlineText.svelte';
	import ListActionButton from '$lib/patterns/list-page/ListActionButton.svelte';
	import FloatingTooltip from '$lib/ui/FloatingTooltip.svelte';
	import type { NonLinkInlineTextContent } from '$lib/domain/inline-text';
	import type { ListIcon } from '$lib/patterns/list-page/types';

	type Props = {
		title: string;
		description: NonLinkInlineTextContent;
		learnMoreLabel?: string;
		actionLabel?: string;
		actionHelpText?: string;
		actionHelpTooltipText?: string;
		onAction?: () => void;
		icon?: ListIcon;
		class?: string;
	};

	let {
		title,
		description,
		learnMoreLabel,
		actionLabel,
		actionHelpText,
		actionHelpTooltipText,
		onAction,
		icon: Icon = DatabaseIcon,
		class: className = ''
	}: Props = $props();
</script>

<div
	class={cn(
		'flex min-h-60 w-full items-center justify-center px-6 py-8 md:min-h-60',
		className
	)}
>
	<div class="flex w-full flex-col items-center text-center">
		<div class="flex max-w-56 flex-col items-center">
			<Icon
				aria-hidden="true"
				size={24}
				weight="regular"
				color="currentColor"
				class="mb-5 text-stone-950"
			/>

			<h2 class="text-[0.78rem] leading-tight font-medium text-stone-950">
				{title}
			</h2>

			<p class="mt-2.5 text-[0.67rem] leading-relaxed text-stone-600 md:text-[0.69rem]">
				<InlineText
					content={description}
					tooltipIdPrefix={`empty-list-description-tooltip-${title}`}
					tooltipTriggerClass="inline text-[0.67rem] leading-relaxed text-stone-400 underline decoration-stone-200 underline-offset-3 transition-colors hover:text-stone-600 hover:decoration-stone-400 focus-visible:text-stone-700 focus-visible:decoration-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 md:text-[0.69rem]"
				/>
				{#if learnMoreLabel}
					<button
						type="button"
						class="ml-1 inline-flex items-center gap-1 text-link-500 hover:text-link-600"
					>
						<span>{learnMoreLabel}</span>
						<ArrowSquareOutIcon aria-hidden="true" size={12} weight="regular" />
					</button>
				{/if}
			</p>

			{#if actionLabel}
				<ListActionButton label={actionLabel} tone="secondary" class="mt-6" onclick={onAction} />
				{#if actionHelpText}
					{#if actionHelpTooltipText}
						<div class="mt-3 max-w-64 text-[0.66rem] leading-relaxed text-stone-500">
							<FloatingTooltip
								id={`empty-list-action-help-${actionLabel}`}
								text={actionHelpTooltipText}
								ariaLabel={actionHelpText}
								placement="bottom-start"
								triggerClass="inline text-[0.66rem] leading-relaxed text-stone-400 underline decoration-stone-200 underline-offset-3 transition-colors hover:text-stone-600 hover:decoration-stone-400 focus-visible:text-stone-700 focus-visible:decoration-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
							>
								{#snippet trigger()}
									{actionHelpText}
								{/snippet}
							</FloatingTooltip>
						</div>
					{:else}
						<p class="mt-3 max-w-64 text-[0.66rem] leading-relaxed text-stone-500">
							{actionHelpText}
						</p>
					{/if}
				{/if}
			{/if}
		</div>
	</div>
</div>
