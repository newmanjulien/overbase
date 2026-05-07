<script lang="ts">
	import { api } from '$convex/_generated/api';
	import { useQuery } from 'convex-svelte';
	import {
		ALL_BUILDER_BLUEPRINT_FILTER,
		toBuilderBlueprintFilter,
		toBuilderBlueprintRecord,
		type BuilderBlueprintFilterId,
		type BuilderBlueprintRecord
	} from '$lib/features/builder-data';
	import BuilderBlueprintCard from '$lib/features/builder-blueprints/BuilderBlueprintCard.svelte';
	import { cn } from '$lib/chrome/shared/cn';

	let selectedFilterId = $state<BuilderBlueprintFilterId>('all');

	const loadingCardPlaceholders = [0, 1, 2, 3];
	const builderHomeQuery = useQuery(api.builder.listBuilderHome);
	const queryError = $derived(builderHomeQuery.error ?? null);
	const filters = $derived([
		ALL_BUILDER_BLUEPRINT_FILTER,
		...(builderHomeQuery.data?.categories ?? []).map(toBuilderBlueprintFilter)
	]);
	const blueprints = $derived(
		(builderHomeQuery.data?.blueprints ?? []).map(toBuilderBlueprintRecord)
	);
	const isLoading = $derived(builderHomeQuery.data === undefined);

	function blueprintMatchesFilter(
		blueprint: BuilderBlueprintRecord,
		filterId: BuilderBlueprintFilterId
	) {
		return filterId === 'all' || blueprint.categoryIds.includes(filterId);
	}

	const visibleBlueprints = $derived(
		blueprints.filter((blueprint) => blueprintMatchesFilter(blueprint, selectedFilterId))
	);
</script>

<section class="w-full" aria-labelledby="builder-blueprint-gallery-title">
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
					{#each visibleBlueprints as blueprint (blueprint.id)}
						<BuilderBlueprintCard {blueprint} />
					{/each}
				</div>
			{/if}
	</div>
</section>
