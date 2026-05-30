<script lang="ts">
	import { InfoBar } from '$lib/ui';
	import { ListContentState, ListPage } from '$lib/patterns/list-page';
	import type { BuilderGalleryEntry } from '../../../../builders/registry';
	import BuilderCard from './BuilderCard.svelte';

	type Props = {
		builders: readonly BuilderGalleryEntry[];
	};

	let { builders }: Props = $props();
</script>

<ListPage contentClass="border-0 bg-transparent">
	{#if builders.length === 0}
		<ListContentState kind="empty" message="No formats available." class="rounded-sm border" />
	{:else}
		<div class="grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-3 xl:grid-cols-4">
			{#each builders as builder (builder.slug)}
				<BuilderCard {builder} />
			{/each}
		</div>
	{/if}

	{#snippet footer()}
		<InfoBar label="Tip:">
			These are emails your team receives, not your clients
		</InfoBar>
	{/snippet}
</ListPage>
