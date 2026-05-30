<script lang="ts">
	import { resolve } from '$app/paths';
	import { buildFormatLink } from '$lib/app/app-links';
	import { toBuilderArtworkPreset } from '../../../../builders/artwork';
	import type { BuilderGalleryEntry } from '../../../../builders/registry';
	import BuilderCardArtwork from './BuilderCardArtwork.svelte';

	type Props = {
		builder: BuilderGalleryEntry;
	};

	let { builder }: Props = $props();
	const artwork = $derived(toBuilderArtworkPreset(builder.artwork).card);
	const link = $derived(buildFormatLink(builder.slug));
</script>

<a
	href={resolve(link.routeId, { builderSlug: builder.slug })}
	class="group block w-full rounded-lg p-1.5 text-left outline-none hover:bg-stone-100/80 focus-visible:bg-stone-100/80"
	aria-label={`Start with ${builder.title}`}
>
	<BuilderCardArtwork {artwork} />

	<div class="px-0.5 pt-1.5">
		<h3 class="truncate text-[0.76rem] font-medium tracking-normal text-stone-950 md:text-[0.78rem]">
			{builder.title}
		</h3>
		<p class="mt-0.5 line-clamp-2 text-[0.68rem] leading-snug text-stone-500 md:text-[0.7rem]">
			{builder.description}
		</p>
	</div>
</a>
