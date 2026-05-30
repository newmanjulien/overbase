<script lang="ts">
	import { resolve } from '$app/paths';
	import { blueprintLink } from '$lib/app/app-links';
	import { toBlueprintArtworkPreset } from '../../../../blueprints/artwork';
	import type { BlueprintRegistryEntry } from '../../../../blueprints/registry';
	import BlueprintCardArtwork from './BlueprintCardArtwork.svelte';

	type Props = {
		blueprint: BlueprintRegistryEntry;
	};

	let { blueprint }: Props = $props();
	const artwork = $derived(toBlueprintArtworkPreset(blueprint.artwork).card);
	const link = $derived(blueprintLink(blueprint.slug));
</script>

<a
	href={resolve(link.routeId, { blueprintSlug: blueprint.slug })}
	class="group block w-full rounded-lg p-1.5 text-left outline-none hover:bg-stone-100/80 focus-visible:bg-stone-100/80"
	aria-label={`Start with ${blueprint.title}`}
>
	<BlueprintCardArtwork {artwork} />

	<div class="px-0.5 pt-1.5">
		<h3 class="truncate text-[0.76rem] font-medium tracking-normal text-stone-950 md:text-[0.78rem]">
			{blueprint.title}
		</h3>
		<p class="mt-0.5 line-clamp-2 text-[0.68rem] leading-snug text-stone-500 md:text-[0.7rem]">
			{blueprint.description}
		</p>
	</div>
</a>
