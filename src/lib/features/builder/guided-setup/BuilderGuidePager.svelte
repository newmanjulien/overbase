<script lang="ts">
	import { cn } from '$lib/ui/cn';

	type Props = {
		step: number;
		totalSteps: number;
		canGoPrevious: boolean;
		canGoNext: boolean;
		onPrevious: () => void;
		onNext: () => void;
	};

	let { step, totalSteps, canGoPrevious, canGoNext, onPrevious, onNext }: Props = $props();
	const pageLabel = $derived(`${step} of ${totalSteps}`);
	const showPager = $derived(totalSteps > 1);
</script>

{#if showPager}
	<div class="flex shrink-0 items-center gap-1 text-[0.72rem] text-stone-500">
		<button
			type="button"
			aria-label="Previous question"
			class={cn(
				'grid size-5 place-items-center rounded-[6px] disabled:cursor-default disabled:hover:bg-transparent',
				canGoPrevious ? 'text-stone-500 hover:bg-stone-100' : 'text-stone-300'
			)}
			disabled={!canGoPrevious}
			onclick={onPrevious}
		>
			<span class="text-[1rem] leading-none">‹</span>
		</button>
		<span>{pageLabel}</span>
		<button
			type="button"
			aria-label="Next question"
			class={cn(
				'grid size-5 place-items-center rounded-[6px] disabled:cursor-default disabled:hover:bg-transparent',
				canGoNext ? 'text-stone-500 hover:bg-stone-100' : 'text-stone-300'
			)}
			disabled={!canGoNext}
			onclick={onNext}
		>
			<span class="text-[1rem] leading-none">›</span>
		</button>
	</div>
{/if}
