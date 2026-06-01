<script lang="ts">
	import { resolve } from '$app/paths';
	import { createFormatLink } from '$lib/app/app-links';
	import { toFormatStarterArtworkPreset } from '$lib/features/format-starters/artwork';
	import type { FormatStarterGalleryEntry } from '$lib/features/format-starters/catalog';
	import { HelpTooltip } from '$lib/ui';
	import { cn } from '$lib/ui/cn';
	import FormatStarterCardArtwork from './FormatStarterCardArtwork.svelte';

	type Props = {
		formatStarter: FormatStarterGalleryEntry;
	};

	let { formatStarter }: Props = $props();
	const artwork = $derived(toFormatStarterArtworkPreset(formatStarter.artwork));
	const link = $derived(createFormatLink(formatStarter.slug));
	const cardClass = $derived(
		cn(
			'group w-full rounded-sm p-1.5 text-left transition-colors',
			formatStarter.mode === 'public-data'
				? 'bg-stone-50 hover:bg-white hover:ring-stone-300/90'
				: 'bg-white hover:bg-stone-50'
		)
	);
</script>

<div class={cardClass}>
	<a
		href={resolve(link.routeId, { formatStarterSlug: formatStarter.slug })}
		class="block rounded-sm outline-none focus-visible:bg-stone-100/80 focus-visible:ring-2 focus-visible:ring-stone-300"
		aria-label={`Start with ${formatStarter.title}`}
	>
		<FormatStarterCardArtwork artwork={artwork.card} iconId={artwork.iconId} />
	</a>

	<div class="px-0.5 pt-1.5">
		<div class="flex min-w-0 items-center gap-1.5">
			<a
				href={resolve(link.routeId, { formatStarterSlug: formatStarter.slug })}
				class="min-w-0 rounded-sm outline-none focus-visible:bg-stone-100/80 focus-visible:ring-2 focus-visible:ring-stone-300"
			>
				<h3 class="truncate text-[0.76rem] font-medium tracking-normal text-stone-950 md:text-[0.78rem]">
					{formatStarter.title}
				</h3>
			</a>
			{#if formatStarter.mode === 'public-data'}
				<HelpTooltip
					id={`format-card-${formatStarter.slug}-rules-info`}
					text="This format starter creates an email format that only uses public data and doesn't use any of your internal data"
					ariaLabel={`About ${formatStarter.title}`}
					placement="bottom-end"
					triggerClass="grid size-3.5 place-items-center text-stone-400 focus-visible:outline-none"
				/>
			{/if}
		</div>
		<p class="mt-0.5 line-clamp-2 text-[0.68rem] leading-snug text-stone-500 md:text-[0.7rem]">
			<a
				href={resolve(link.routeId, { formatStarterSlug: formatStarter.slug })}
				class="rounded-sm outline-none focus-visible:bg-stone-100/80 focus-visible:ring-2 focus-visible:ring-stone-300"
			>
				{formatStarter.description}
			</a>
		</p>
	</div>
</div>
