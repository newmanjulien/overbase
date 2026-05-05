<script lang="ts">
	import { api } from '$convex/_generated/api';
	import { useQuery } from 'convex-svelte';
	import {
		toBuilderCardArtworkPreset,
		toBuilderCardFilter,
		toBuilderCardRecord,
		type BuilderCardFilterId,
		type BuilderCardRecord
	} from '$lib/features/builder-data';
	import BuilderCard from '$lib/features/builder-cards/BuilderCard.svelte';
	import { cn } from '$lib/chrome/shared/cn';

	let selectedFilterId = $state<BuilderCardFilterId>('all');

	const loadingCardPlaceholders = [0, 1, 2, 3];
	const categoriesQuery = useQuery(api.builder.listCategories);
	const cardsQuery = useQuery(api.builder.listActiveTemplateCards);
	const artworkPresetsQuery = useQuery(api.builder.listCardArtworkPresets);
	const queryError = $derived(
		categoriesQuery.error ?? cardsQuery.error ?? artworkPresetsQuery.error ?? null
	);
	const filters = $derived((categoriesQuery.data ?? []).map(toBuilderCardFilter));
	const cards = $derived((cardsQuery.data ?? []).map(toBuilderCardRecord));
	const artworkPresetsById = $derived(
		Object.fromEntries(
			(artworkPresetsQuery.data ?? []).map((preset) => {
				const artwork = toBuilderCardArtworkPreset(preset);
				return [artwork.id, artwork];
			})
		)
	);
	const isLoading = $derived(
		categoriesQuery.data === undefined ||
			cardsQuery.data === undefined ||
			artworkPresetsQuery.data === undefined
	);

	function cardMatchesFilter(card: BuilderCardRecord, filterId: BuilderCardFilterId) {
		return filterId === 'all' || card.categoryIds.includes(filterId);
	}

	const visibleCards = $derived(
		cards.filter((card) => cardMatchesFilter(card, selectedFilterId))
	);
</script>

<section class="w-full" aria-labelledby="builder-card-section-title">
	<div class="-mx-1 overflow-x-auto px-1">
		<div class="flex min-w-max items-center gap-1.5 md:min-w-0 md:flex-wrap">
			{#each filters as filter (filter.id)}
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
		{#if queryError}
			<div class="mt-4 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">
				{queryError.message}
			</div>
		{:else if isLoading}
			<div class="mt-4 grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-3">
				{#each loadingCardPlaceholders as index (index)}
					<div class="h-36 animate-pulse rounded-sm bg-zinc-100"></div>
				{/each}
			</div>
		{:else}
			<div class="mt-4 grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-3">
				{#each visibleCards as card (card.id)}
					{@const artwork = artworkPresetsById[card.artworkId]}
					{#if artwork}
						<BuilderCard {card} {artwork} />
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</section>
