import ArrowRight from 'phosphor-svelte/lib/ArrowRight';
import BellRinging from 'phosphor-svelte/lib/BellRinging';
import Club from 'phosphor-svelte/lib/Club';
import Flag from 'phosphor-svelte/lib/Flag';
import Handshake from 'phosphor-svelte/lib/Handshake';
import Lightning from 'phosphor-svelte/lib/Lightning';
import MagnifyingGlassPlus from 'phosphor-svelte/lib/MagnifyingGlassPlus';
import Network from 'phosphor-svelte/lib/Network';
import Quotes from 'phosphor-svelte/lib/Quotes';
import Sparkle from 'phosphor-svelte/lib/Sparkle';
import Target from 'phosphor-svelte/lib/Target';
import Users from 'phosphor-svelte/lib/Users';
import type { BuilderAppArtwork } from '../../../../builder-apps/presentation';
import type { PhosphorIcon } from '$lib/components/icons/types';

type ArtworkIcon = PhosphorIcon;

export type BuilderArtworkCardTone = 'coral' | 'violet' | 'aqua' | 'zinc';
export type BuilderArtworkCardSymbolSize = 'sm' | 'md';

export type BuilderArtworkPreset = {
	id: string;
	card: {
		tone: BuilderArtworkCardTone;
		iconId: string;
		icon: ArtworkIcon;
		symbolSize: BuilderArtworkCardSymbolSize;
	};
	panel: {
		backColor: string;
		frontColor: string;
		iconId: string;
		icon: ArtworkIcon;
		iconCenterX: string;
		iconCenterY: string;
	};
};

const ARTWORK_ICONS: Record<string, ArtworkIcon> = {
	'arrow-right': ArrowRight,
	'bell-ring': BellRinging,
	club: Club,
	flag: Flag,
	handshake: Handshake,
	'message-square-quote': Quotes,
	network: Network,
	'scan-search': MagnifyingGlassPlus,
	sparkles: Sparkle,
	target: Target,
	'users-round': Users,
	zap: Lightning
};

function getArtworkIcon(iconId: string) {
	return ARTWORK_ICONS[iconId] ?? Flag;
}

export function toBuilderArtworkPreset(artwork: BuilderAppArtwork): BuilderArtworkPreset {
	return {
		id: artwork.id,
		card: {
			tone: artwork.card.tone,
			iconId: artwork.card.iconId,
			icon: getArtworkIcon(artwork.card.iconId),
			symbolSize: artwork.card.symbolSize
		},
		panel: {
			backColor: artwork.panel.backColor,
			frontColor: artwork.panel.frontColor,
			iconId: artwork.panel.iconId,
			icon: getArtworkIcon(artwork.panel.iconId),
			iconCenterX: artwork.panel.iconCenterX,
			iconCenterY: artwork.panel.iconCenterY
		}
	};
}
