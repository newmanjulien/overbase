<script lang="ts">
	import FloatingTooltip, {
		type FloatingTooltipPlacement
	} from '$lib/components/ui/FloatingTooltip.svelte';

	type Props = {
		id: string;
		label: string;
		text: string;
		placement?: FloatingTooltipPlacement;
	};

	let { id, label, text, placement = 'bottom-start' }: Props = $props();
</script>

<div class="flex">
	<FloatingTooltip
		{id}
		{text}
		ariaLabel={label}
		{placement}
		triggerClass="rounded-sm text-left text-[0.8125rem] leading-[1.35] text-zinc-400/80 underline decoration-1 underline-offset-2 outline-none transition-colors duration-150 hover:text-[#202124] hover:decoration-[#202124] focus-visible:shadow-[0_0_0_3px_rgb(18_150_247_/_25%)]"
		panelClass="text-[#4d5259]"
	>
		{#snippet trigger()}
			{label}
		{/snippet}
	</FloatingTooltip>
</div>
