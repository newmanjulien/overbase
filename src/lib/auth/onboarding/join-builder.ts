import { getBuilder } from '$lib/features/builder/catalog';
import type { BuilderArtwork } from '$lib/features/builder/domain';

const JOIN_FLOW_BUILDER = {
	builderSlug: 'reconnect-linkedin',
	startingPointId: 'linkedin-reconnect'
} as const;

export type JoinBuilderRecommendation = {
	slug: string;
	title: string;
	description: string;
	artwork: BuilderArtwork;
};

export function getJoinBuilderRecommendation(): JoinBuilderRecommendation {
	const builder = getBuilder(JOIN_FLOW_BUILDER.builderSlug);

	if (!builder) {
		throw new Error(`Join builder "${JOIN_FLOW_BUILDER.builderSlug}" is not available.`);
	}

	const startingPoint = builder.startingPoints.find(
		(entry) => entry.id === JOIN_FLOW_BUILDER.startingPointId
	);

	if (!startingPoint) {
		throw new Error(
			`Join builder "${JOIN_FLOW_BUILDER.builderSlug}" does not define starting point "${JOIN_FLOW_BUILDER.startingPointId}".`
		);
	}

	return {
		slug: builder.slug,
		title: startingPoint.label,
		description: builder.description,
		artwork: builder.artwork
	};
}
