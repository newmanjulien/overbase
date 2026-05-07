<script lang="ts">
	import BuilderBlueprintCardArtwork from '$lib/features/builder-blueprints/artwork/BuilderBlueprintCardArtwork.svelte';
	import type { BuilderBlueprintRecord } from '$lib/features/builder-data';
	import { submitBuilderBlueprint } from '$lib/features/builder-blueprints/builder-blueprint-submit';

	type Props = {
		blueprint: BuilderBlueprintRecord;
	};

	let { blueprint }: Props = $props();

	async function handleSelect() {
		await submitBuilderBlueprint(blueprint);
	}
</script>

<button
	type="button"
	class="group block w-full rounded-sm text-left outline-none"
	aria-label={`Start with ${blueprint.title}`}
	onclick={() => {
		void handleSelect();
	}}
>
	<BuilderBlueprintCardArtwork artwork={blueprint.artwork.card} />

	<div class="px-0.5 pt-1.5">
		<h3 class="truncate text-[0.76rem] font-medium tracking-normal text-zinc-950 md:text-[0.78rem]">
				{blueprint.title}
		</h3>
		<p class="mt-0.5 line-clamp-2 text-[0.68rem] leading-snug text-zinc-500 md:text-[0.7rem]">
				{blueprint.description}
		</p>
	</div>
</button>
