<script lang="ts">
	import { InfoBar } from '$lib/ui';
	import { ListContentState, ListPage } from '$lib/patterns/list-page';
	import type { BlueprintRegistryEntry } from '../../../../blueprints/registry';
	import BlueprintCard from './BlueprintCard.svelte';

	type Props = {
		blueprints: readonly BlueprintRegistryEntry[];
	};

	let { blueprints }: Props = $props();
</script>

<ListPage contentClass="border-0 bg-transparent">
	{#if blueprints.length === 0}
		<ListContentState kind="empty" message="No blueprints available." class="rounded-sm border" />
	{:else}
		<div class="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-3 xl:grid-cols-4">
			{#each blueprints as blueprint (blueprint.slug)}
				<BlueprintCard {blueprint} />
			{/each}
		</div>
	{/if}

	{#snippet footer()}
		<InfoBar label="Next steps:">
			Start from a blueprint and edit it locally before publishing
		</InfoBar>
	{/snippet}
</ListPage>
