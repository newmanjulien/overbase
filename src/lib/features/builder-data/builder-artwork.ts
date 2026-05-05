import {
	ArrowRight,
	BellRing,
	Club,
	Flag,
	Handshake,
	MessageSquareQuote,
	Network,
	ScanSearch,
	Sparkles,
	Target,
	UsersRound,
	Zap
} from 'lucide-svelte';
import type { Doc } from '$convex/_generated/dataModel';

type ArtworkIcon = typeof Flag;

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
	blueprint: {
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
	'bell-ring': BellRing,
	club: Club,
	flag: Flag,
	handshake: Handshake,
	'message-square-quote': MessageSquareQuote,
	network: Network,
	'scan-search': ScanSearch,
	sparkles: Sparkles,
	target: Target,
	'users-round': UsersRound,
	zap: Zap
};

function getArtworkIcon(iconId: string) {
	return ARTWORK_ICONS[iconId] ?? Flag;
}

export function toBuilderArtworkPreset(artwork: Doc<'builderArtworkPresets'>): BuilderArtworkPreset {
	return {
		id: artwork.slug,
		card: {
			tone: artwork.card.tone,
			iconId: artwork.card.iconId,
			icon: getArtworkIcon(artwork.card.iconId),
			symbolSize: artwork.card.symbolSize
		},
		blueprint: {
			backColor: artwork.blueprint.backColor,
			frontColor: artwork.blueprint.frontColor,
			iconId: artwork.blueprint.iconId,
			icon: getArtworkIcon(artwork.blueprint.iconId),
			iconCenterX: artwork.blueprint.iconCenterX,
			iconCenterY: artwork.blueprint.iconCenterY
		}
	};
}
