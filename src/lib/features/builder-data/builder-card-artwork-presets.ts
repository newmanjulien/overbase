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

type ArtworkIcon = typeof Flag;

export type BuilderCardArtworkTone = 'coral' | 'violet' | 'aqua' | 'zinc';
export type BuilderCardArtworkFrame = 'inset-panel';
export type BuilderCardArtworkSymbolSize = 'sm' | 'md';

export type BuilderCardArtworkPreset = {
	tone: BuilderCardArtworkTone;
	icon: ArtworkIcon;
	frame: BuilderCardArtworkFrame;
	symbolSize: BuilderCardArtworkSymbolSize;
};

export const BUILDER_CARD_ARTWORK_PRESETS = {
	'flag-coral': {
		tone: 'coral',
		icon: Flag,
		frame: 'inset-panel',
		symbolSize: 'sm'
	},
	'zap-violet': {
		tone: 'violet',
		icon: Zap,
		frame: 'inset-panel',
		symbolSize: 'md'
	},
	'arrow-coral': {
		tone: 'coral',
		icon: ArrowRight,
		frame: 'inset-panel',
		symbolSize: 'md'
	},
	'quote-aqua': {
		tone: 'aqua',
		icon: MessageSquareQuote,
		frame: 'inset-panel',
		symbolSize: 'md'
	},
	'club-coral': {
		tone: 'coral',
		icon: Club,
		frame: 'inset-panel',
		symbolSize: 'md'
	},
	'spark-coral': {
		tone: 'coral',
		icon: Sparkles,
		frame: 'inset-panel',
		symbolSize: 'md'
	},
	'target-zinc': {
		tone: 'zinc',
		icon: Target,
		frame: 'inset-panel',
		symbolSize: 'md'
	},
	'handshake-violet': {
		tone: 'violet',
		icon: Handshake,
		frame: 'inset-panel',
		symbolSize: 'md'
	},
	'team-violet': {
		tone: 'violet',
		icon: UsersRound,
		frame: 'inset-panel',
		symbolSize: 'md'
	},
	'search-aqua': {
		tone: 'aqua',
		icon: ScanSearch,
		frame: 'inset-panel',
		symbolSize: 'md'
	},
	'alert-coral': {
		tone: 'coral',
		icon: BellRing,
		frame: 'inset-panel',
		symbolSize: 'md'
	},
	'network-zinc': {
		tone: 'zinc',
		icon: Network,
		frame: 'inset-panel',
		symbolSize: 'md'
	}
} as const satisfies Record<string, BuilderCardArtworkPreset>;

export type BuilderCardArtworkId = keyof typeof BUILDER_CARD_ARTWORK_PRESETS;
