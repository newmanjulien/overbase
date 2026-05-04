<script lang="ts">
	import {
		BUILDER_CARD_FILTERS,
		BUILDER_CARDS,
		type BuilderCardFilterId,
		type BuilderCardRecord
	} from '$lib/features/builder-data';
	import BuilderCard from '$lib/features/builder-cards/BuilderCard.svelte';
	import { cn } from '$lib/chrome/shared/cn';

	let selectedFilterId = $state<BuilderCardFilterId>('all');

	function cardMatchesFilter(card: BuilderCardRecord, filterId: BuilderCardFilterId) {
		return filterId === 'all' || card.categoryIds.includes(filterId);
	}

	const visibleCards = $derived(BUILDER_CARDS.filter((card) => cardMatchesFilter(card, selectedFilterId)));
</script>

<section class="w-full" aria-labelledby="builder-card-section-title">
	<div class="-mx-1 overflow-x-auto px-1">
		<div class="flex min-w-max items-center gap-1.5 md:min-w-0 md:flex-wrap">
			{#each BUILDER_CARD_FILTERS as filter (filter.id)}
				{@const Icon = filter.icon}
				<button
					type="button"
					class={cn(
						'inline-flex h-8 items-center justify-center gap-1.5 rounded-full border px-3 text-[0.76rem] font-normal transition-colors md:h-8 md:px-3.5 md:text-[0.78rem]',
						selectedFilterId === filter.id
							? 'border-zinc-950 bg-zinc-950 text-white'
							: 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50'
					)}
					aria-pressed={selectedFilterId === filter.id}
					onclick={() => {
						selectedFilterId = filter.id;
					}}
				>
					<Icon class="size-3.5 shrink-0" />
					<span>{filter.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="mt-5">
		<div class="mt-4 grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-3">
			{#each visibleCards as card (card.id)}
				<BuilderCard {card} />
			{/each}
		</div>
	</div>
</section>
