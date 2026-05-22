<script lang="ts">
	import type { ClassValue } from 'clsx';
	import { cn } from '$lib/ui/cn';
	import FloatingTooltip from '$lib/ui/FloatingTooltip.svelte';
	import type { InlineTextContent } from '$lib/ui/inline-text';

	type Props = {
		content: InlineTextContent;
		tooltipIdPrefix: string;
		tooltipPlacement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
		tooltipTriggerClass?: ClassValue;
	};

	let {
		content,
		tooltipIdPrefix,
		tooltipPlacement = 'bottom-start',
		tooltipTriggerClass = ''
	}: Props = $props();

	const safeTooltipIdPrefix = $derived(tooltipIdPrefix.replace(/[^a-zA-Z0-9_-]/g, '-'));
</script>

{#if typeof content === 'string'}<span>{content}</span>{:else}{#each content as part, index (`${part.kind}:${index}`)}{#if part.kind === 'text'}<span>{part.text}</span>{:else}<FloatingTooltip
				id={`${safeTooltipIdPrefix}-${index}`}
				text={part.tooltipText}
				ariaLabel={part.label}
				placement={tooltipPlacement}
				triggerClass={cn(tooltipTriggerClass)}
			>
				{#snippet trigger()}{part.label}{/snippet}
			</FloatingTooltip>{/if}{/each}{/if}
