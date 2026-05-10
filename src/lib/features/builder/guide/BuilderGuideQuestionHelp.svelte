<script lang="ts">
	import { CircleQuestionMark } from 'lucide-svelte';
	import { FloatingTooltip } from '$lib/components/ui';

	type Props = {
		id: string;
		text?: string | null;
	};

	let { id, text = null }: Props = $props();

	const helpText = $derived(text?.trim() ?? '');
</script>

<FloatingTooltip
	id={`guide-question-help-${id}`}
	text={helpText}
	ariaLabel="Question help"
	placement="bottom-start"
	triggerClass="grid size-5 place-items-center rounded-[6px] text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:bg-zinc-100 focus-visible:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
>
	{#snippet trigger()}
		<CircleQuestionMark class="size-3.5" strokeWidth={1.9} />
	{/snippet}
</FloatingTooltip>
