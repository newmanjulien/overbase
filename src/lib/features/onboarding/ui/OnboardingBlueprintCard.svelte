<script lang="ts">
	import { resolve } from '$app/paths';
	import { BUILDER_FRESH_START_ROUTE, builderAppSlugParams } from '$lib/features/builder/paths';
	import BuilderAppCardArtwork from '$lib/features/builder/home/artwork/BuilderAppCardArtwork.svelte';
	import type { BuilderAppRecord } from '$lib/features/builder/catalog';

	type Props = {
		app: BuilderAppRecord;
		onSelect: (appSlug: string) => void;
	};

	let { app, onSelect }: Props = $props();

	function handleClick(event: MouseEvent) {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		event.preventDefault();
		onSelect(app.id);
	}
</script>

<a
	href={resolve(BUILDER_FRESH_START_ROUTE, builderAppSlugParams(app.id))}
	class="flex min-h-70 w-full flex-col rounded-lg border border-zinc-200/60 bg-white p-2 text-left outline-none transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-zinc-200 focus-visible:-translate-y-0.5 focus-visible:border-zinc-300 focus-visible:shadow-[0_0_0_3px_rgb(24_24_27_/_14%)]"
	aria-label={`Start with ${app.title}`}
	onclick={handleClick}
>
	<div class="rounded-[0.45rem] bg-zinc-50 p-1">
		<BuilderAppCardArtwork artwork={app.artwork.card} />
	</div>

	<div class="flex min-h-0 flex-1 flex-col px-1.5 pt-3">
		<h2 class="truncate text-[0.9rem] font-medium tracking-normal text-zinc-950">
			{app.title}
		</h2>
		<p class="mt-1.5 line-clamp-2 text-[0.78rem] leading-snug text-zinc-500">
			{app.description}
		</p>
		<span
			class="mt-4 inline-flex h-9 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-zinc-200/60 bg-white px-3.5 text-[0.76rem] font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
		>
			Create this format
		</span>
	</div>
</a>
