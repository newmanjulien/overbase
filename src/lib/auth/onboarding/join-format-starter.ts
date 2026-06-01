import { getFormatStarter } from '$lib/features/format-starters/catalog';
import type { FormatStarterArtwork } from '$lib/features/format-starters/domain';

const JOIN_FLOW_FORMAT_STARTER = {
	formatStarterSlug: 'reconnect-linkedin',
	startingPointId: 'linkedin-reconnect'
} as const;

export type JoinFormatStarterRecommendation = {
	slug: string;
	title: string;
	description: string;
	artwork: FormatStarterArtwork;
};

export function getJoinFormatStarterRecommendation(): JoinFormatStarterRecommendation {
	const formatStarter = getFormatStarter(JOIN_FLOW_FORMAT_STARTER.formatStarterSlug);

	if (!formatStarter) {
		throw new Error(`Join format starter "${JOIN_FLOW_FORMAT_STARTER.formatStarterSlug}" is not available.`);
	}

	const startingPoint = formatStarter.startingPoints.find(
		(entry) => entry.id === JOIN_FLOW_FORMAT_STARTER.startingPointId
	);

	if (!startingPoint) {
		throw new Error(
			`Join format starter "${JOIN_FLOW_FORMAT_STARTER.formatStarterSlug}" does not define starting point "${JOIN_FLOW_FORMAT_STARTER.startingPointId}".`
		);
	}

	return {
		slug: formatStarter.slug,
		title: startingPoint.label,
		description: formatStarter.description,
		artwork: formatStarter.artwork
	};
}
