<script lang="ts">
	import BuilderCardArtwork from '$lib/features/builder-cards/artwork/BuilderCardArtwork.svelte';
	import type { BuilderCardRecord } from '$lib/features/builder-data';
	import { submitBuilderCard } from '$lib/features/builder-cards/builder-card-submit';

	type Props = {
		card: BuilderCardRecord;
	};

	let { card }: Props = $props();

	async function handleSelect() {
		await submitBuilderCard(card);
	}
</script>

<button
	type="button"
	class="group block w-full rounded-sm text-left outline-none"
	aria-label={`Start with ${card.title}`}
	onclick={() => {
		void handleSelect();
	}}
>
	<BuilderCardArtwork artworkId={card.artworkId} />

	<div class="px-0.5 pt-1.5">
		<h3 class="truncate text-[0.76rem] font-medium tracking-normal text-zinc-950 md:text-[0.78rem]">
			{card.title}
		</h3>
		<p class="mt-0.5 line-clamp-2 text-[0.68rem] leading-snug text-zinc-500 md:text-[0.7rem]">
			{card.description}
		</p>
	</div>
</button>
