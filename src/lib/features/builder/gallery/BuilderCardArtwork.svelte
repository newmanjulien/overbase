<script lang="ts">
	import FlagIcon from 'phosphor-svelte/lib/FlagIcon';
	import ClipboardTextIcon from 'phosphor-svelte/lib/ClipboardTextIcon';
	import GavelIcon from 'phosphor-svelte/lib/GavelIcon';
	import HandshakeIcon from 'phosphor-svelte/lib/HandshakeIcon';
	import LinkedinLogoIcon from 'phosphor-svelte/lib/LinkedinLogoIcon';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
	import { cn } from '$lib/ui/cn';
	import type { PhosphorIcon } from '$lib/ui/icons';
	import type {
		BuilderArtworkIconId,
		BuilderArtworkCardSymbolSize,
		BuilderArtworkCardTone,
		BuilderArtworkPreset
	} from '$lib/features/builder/artwork';

	type Props = {
		artwork: BuilderArtworkPreset['card'];
		iconId: BuilderArtworkIconId;
	};

	const builderArtworkCardIcons = {
		'clipboard-text': ClipboardTextIcon,
		gavel: GavelIcon,
		handshake: HandshakeIcon,
		'linkedin-logo': LinkedinLogoIcon,
		'trend-up': TrendUpIcon
	} as const satisfies Record<BuilderArtworkIconId, PhosphorIcon>;

	function getBuilderArtworkCardIcon(iconId: BuilderArtworkIconId) {
		return builderArtworkCardIcons[iconId] ?? FlagIcon;
	}

	let { artwork, iconId }: Props = $props();
	const Icon = $derived(getBuilderArtworkCardIcon(iconId));

	const toneClass = {
		coral: 'bg-[#f47464]',
		violet: 'bg-[#a64df0]',
		aqua: 'bg-[#8bddeb]',
		mint: 'bg-[#b7e4c7]',
		blush: 'bg-[#f7b7c8]',
		stone: 'bg-stone-200'
	} as const satisfies Record<BuilderArtworkCardTone, string>;

	const symbolSizeClass = {
		sm: 'size-6 md:size-7',
		md: 'size-7 md:size-8'
	} as const satisfies Record<BuilderArtworkCardSymbolSize, string>;
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
