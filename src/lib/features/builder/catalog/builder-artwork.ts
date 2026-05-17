import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
import BellRingingIcon from 'phosphor-svelte/lib/BellRingingIcon';
import ClubIcon from 'phosphor-svelte/lib/ClubIcon';
import FlagIcon from 'phosphor-svelte/lib/FlagIcon';
import HandshakeIcon from 'phosphor-svelte/lib/HandshakeIcon';
import LightningIcon from 'phosphor-svelte/lib/LightningIcon';
import MagnifyingGlassPlusIcon from 'phosphor-svelte/lib/MagnifyingGlassPlusIcon';
import NetworkIcon from 'phosphor-svelte/lib/NetworkIcon';
import QuotesIcon from 'phosphor-svelte/lib/QuotesIcon';
import SparkleIcon from 'phosphor-svelte/lib/SparkleIcon';
import TargetIcon from 'phosphor-svelte/lib/TargetIcon';
import UsersIcon from 'phosphor-svelte/lib/UsersIcon';
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
	'arrow-right': ArrowRightIcon,
	'bell-ring': BellRingingIcon,
	club: ClubIcon,
	flag: FlagIcon,
	handshake: HandshakeIcon,
	'message-square-quote': QuotesIcon,
	network: NetworkIcon,
	'scan-search': MagnifyingGlassPlusIcon,
	sparkles: SparkleIcon,
	target: TargetIcon,
	'users-round': UsersIcon,
	zap: LightningIcon
};

function getArtworkIcon(iconId: string) {
	return ARTWORK_ICONS[iconId] ?? FlagIcon;
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
