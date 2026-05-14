<script lang="ts">
	import Question from 'phosphor-svelte/lib/Question';
	import FloatingTooltip, { type FloatingTooltipPlacement } from './FloatingTooltip.svelte';

	type Props = {
		id: string;
		text?: string | null;
		ariaLabel?: string;
		placement?: FloatingTooltipPlacement;
	};

	let { id, text = null, ariaLabel = 'Help', placement = 'bottom-start' }: Props = $props();

	const helpText = $derived(text?.trim() ?? '');
</script>

<FloatingTooltip
	{id}
	text={helpText}
	{ariaLabel}
	{placement}
	triggerClass="grid size-5 place-items-center rounded-[6px] text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:bg-zinc-100 focus-visible:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
>
	{#snippet trigger()}
		<Question size={14} weight="regular" />
	{/snippet}
</FloatingTooltip>
