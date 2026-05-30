<script lang="ts">
	import { cn } from '$lib/ui/cn';
	import type {
		BlueprintArtworkCardSymbolSize,
		BlueprintArtworkCardTone,
		BlueprintArtworkPreset
	} from '../../../../blueprints/artwork';

	type Props = {
		artwork: BlueprintArtworkPreset['card'];
	};

	let { artwork }: Props = $props();
	const Icon = $derived(artwork.icon);

	const toneClass = {
		coral: 'bg-[#f47464]',
		violet: 'bg-[#a64df0]',
		aqua: 'bg-[#8bddeb]',
		stone: 'bg-stone-200'
	} as const satisfies Record<BlueprintArtworkCardTone, string>;

	const symbolSizeClass = {
		sm: 'size-6 md:size-7',
		md: 'size-7 md:size-8'
	} as const satisfies Record<BlueprintArtworkCardSymbolSize, string>;
</script>

<div
	class={cn(
		'relative aspect-[1.9/1] w-full overflow-hidden rounded-[0.3rem]',
		toneClass[artwork.tone]
	)}
>
	<div class="absolute inset-x-[15%] top-[13%] bottom-0 rounded-t-[0.45rem] border border-white/80 bg-white/90">
		<div class="flex h-full items-center justify-center">
			<Icon class={cn('text-stone-950', symbolSizeClass[artwork.symbolSize])} />
		</div>
	</div>
</div>
