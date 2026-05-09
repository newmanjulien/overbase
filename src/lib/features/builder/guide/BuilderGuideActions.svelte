<script lang="ts">
	import { ArrowRight } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';

	type Props = {
		canGoNext: boolean;
		onNext: () => void;
		onSubmit: () => void | Promise<void>;
	};

	let { canGoNext, onNext, onSubmit }: Props = $props();
	const primaryActionLabel = $derived(canGoNext ? 'Next' : 'Submit');
</script>

<div class="flex items-center gap-2 self-end">
	<Button variant="secondary" disabled class="text-[0.72rem] text-zinc-900 md:text-[0.74rem]">
		Skip all
	</Button>
	<Button
		variant="primary"
		class="text-[0.72rem] md:text-[0.74rem]"
		onclick={() => {
			if (canGoNext) {
				onNext();
			} else {
				void onSubmit();
			}
		}}
	>
		<span>{primaryActionLabel}</span>
		{#snippet trailing()}
			{#if canGoNext}
				<ArrowRight class="size-3.75" />
			{/if}
		{/snippet}
	</Button>
</div>
