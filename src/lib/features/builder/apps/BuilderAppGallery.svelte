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
	import { FilterPillGroup } from '$lib/components/ui';

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
	<FilterPillGroup
		{filters}
		selectedId={selectedFilterId}
		onSelect={(filterId) => {
			selectedFilterId = filterId;
		}}
	/>

	<div class="mt-5">
		<div class="mt-4 grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-3">
			{#each visibleApps as app (app.id)}
				<BuilderAppCard {app} />
			{/each}
		</div>
	</div>
</section>
