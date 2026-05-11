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
	import { FilterPillGroup, HelpTooltip } from '$lib/components/ui';

	const BLUEPRINT_HELP_TEXT =
		'Blueprints are guided starting points for common notification workflows. Pick one to answer a few setup questions and generate a tailored draft.';

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
	<div class="flex items-center gap-1.5">
		<h2 id="builder-app-gallery-title" class="text-[0.82rem] font-medium text-zinc-950">
			Start with a blueprint
		</h2>
		<HelpTooltip id="builder-app-gallery-blueprint-help" text={BLUEPRINT_HELP_TEXT} />
	</div>

	<FilterPillGroup
		{filters}
		selectedId={selectedFilterId}
		onSelect={(filterId) => {
			selectedFilterId = filterId;
		}}
		class="mt-5"
	/>

	<div class="mt-5">
		<div class="mt-4 grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-3">
			{#each visibleApps as app (app.id)}
				<BuilderAppCard {app} />
			{/each}
		</div>
	</div>
</section>
