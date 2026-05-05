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

export type BuilderCardArtworkTone = 'coral' | 'violet' | 'aqua' | 'zinc';
export type BuilderCardArtworkSymbolSize = 'sm' | 'md';

export type BuilderCardArtworkPreset = {
	id: string;
	tone: BuilderCardArtworkTone;
	iconId: string;
	icon: ArtworkIcon;
	symbolSize: BuilderCardArtworkSymbolSize;
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

export function toBuilderCardArtworkPreset(
	preset: Doc<'builderCardArtworkPresets'>
): BuilderCardArtworkPreset {
	return {
		id: preset.slug,
		tone: preset.tone,
		iconId: preset.iconId,
		icon: getArtworkIcon(preset.iconId),
		symbolSize: preset.symbolSize
	};
}
