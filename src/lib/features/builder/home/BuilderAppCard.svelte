<script lang="ts">
	import { resolve } from '$app/paths';
	import { BUILDER_FRESH_START_ROUTE, builderAppSlugParams } from '$lib/features/builder/paths';
	import BuilderAppCardArtwork from './artwork/BuilderAppCardArtwork.svelte';
	import type { BuilderAppRecord } from '$lib/features/builder/catalog';

	type Props = {
		app: BuilderAppRecord;
	};

	let { app }: Props = $props();
</script>

<a
	href={resolve(BUILDER_FRESH_START_ROUTE, builderAppSlugParams(app.id))}
	class="group block w-full rounded-lg p-1.5 text-left outline-none hover:bg-zinc-100/80 focus-visible:bg-zinc-100/80"
	aria-label={`Start with ${app.title}`}
>
	<BuilderAppCardArtwork artwork={app.artwork.card} />

	<div class="px-0.5 pt-1.5">
		<h3 class="truncate text-[0.76rem] font-medium tracking-normal text-zinc-950 md:text-[0.78rem]">
			{app.title}
		</h3>
		<p class="mt-0.5 line-clamp-2 text-[0.68rem] leading-snug text-zinc-500 md:text-[0.7rem]">
			{app.description}
		</p>
	</div>
</a>
