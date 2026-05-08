<script lang="ts">
	import {
		ALL_BUILDER_APP_FILTER,
		toBuilderAppFilter,
		toBuilderAppRecord,
		type BuilderAppHomeData,
		type BuilderAppFilterId,
		type BuilderAppRecord
	} from '$lib/features/builder/data';
	import BuilderAppCard from '$lib/features/builder/apps/BuilderAppCard.svelte';
	import { cn } from '$lib/components/chrome/shared/cn';

	type Props = {
		builderHome: BuilderAppHomeData;
	};

	let { builderHome }: Props = $props();
	let selectedFilterId = $state<BuilderAppFilterId>('all');

	const filters = $derived([
		ALL_BUILDER_APP_FILTER,
		...builderHome.categories.map(toBuilderAppFilter)
	]);
	const apps = $derived(builderHome.apps.map(toBuilderAppRecord));

	function appMatchesFilter(app: BuilderAppRecord, filterId: BuilderAppFilterId) {
		return filterId === 'all' || app.categoryIds.includes(filterId);
	}

	const visibleApps = $derived(apps.filter((app) => appMatchesFilter(app, selectedFilterId)));
</script>

<section class="w-full" aria-labelledby="builder-app-gallery-title">
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
		<div class="mt-4 grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-3">
			{#each visibleApps as app (app.id)}
				<BuilderAppCard {app} />
			{/each}
		</div>
	</div>
</section>
