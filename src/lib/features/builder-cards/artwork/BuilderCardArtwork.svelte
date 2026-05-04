<script lang="ts">
	import { cn } from '$lib/chrome/shared/cn';
	import {
		BUILDER_CARD_ARTWORK_PRESETS,
		type BuilderCardArtworkId,
		type BuilderCardArtworkSymbolSize,
		type BuilderCardArtworkTone
	} from '$lib/features/builder-data';

	type Props = {
		artworkId: BuilderCardArtworkId;
	};

	let { artworkId }: Props = $props();
	const artwork = $derived(BUILDER_CARD_ARTWORK_PRESETS[artworkId]);
	const Icon = $derived(artwork.icon);

	const toneClass = {
		coral: 'bg-[#f47464]',
		violet: 'bg-[#a64df0]',
		aqua: 'bg-[#8bddeb]',
		zinc: 'bg-zinc-200'
	} as const satisfies Record<BuilderCardArtworkTone, string>;

	const symbolSizeClass = {
		sm: 'size-6 md:size-7',
		md: 'size-7 md:size-8'
	} as const satisfies Record<BuilderCardArtworkSymbolSize, string>;
</script>

<div
	class={cn(
		'relative aspect-[1.9/1] w-full overflow-hidden rounded-[0.3rem] transition-transform duration-200 group-hover:scale-[1.01]',
		toneClass[artwork.tone]
	)}
>
	<div class="absolute inset-x-[15%] top-[13%] bottom-0 rounded-t-[0.45rem] border border-white/80 bg-white/90">
		<div class="flex h-full items-center justify-center">
			<Icon class={cn('text-zinc-950', symbolSizeClass[artwork.symbolSize])} />
		</div>
	</div>
</div>
