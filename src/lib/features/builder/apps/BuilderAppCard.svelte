<script lang="ts">
	import { resolve } from '$app/paths';
	import BuilderAppCardArtwork from '$lib/features/builder/apps/artwork/BuilderAppCardArtwork.svelte';
	import type { BuilderAppRecord } from '$lib/features/builder/data';

	type Props = {
		app: BuilderAppRecord;
	};

	let { app }: Props = $props();
</script>

<a
	href={resolve('/builder/[appSlug]?fresh=1', { appSlug: app.id })}
	class="group block w-full rounded-sm text-left outline-none"
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
