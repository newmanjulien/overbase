import { getFormatStarter } from "$lib/features/format-starters/catalog";
import type { FormatStarterGalleryEntry } from "$lib/features/format-starters/catalog";

const JOIN_FLOW_FORMAT_STARTER = {
  formatStarterSlug: "reconnect-linkedin",
  variantSlug: "personal",
} as const;

export type JoinFormatStarterRecommendation = FormatStarterGalleryEntry;

export function getJoinFormatStarterRecommendation(): JoinFormatStarterRecommendation {
  const formatStarter = getFormatStarter(
    JOIN_FLOW_FORMAT_STARTER.formatStarterSlug,
  );

  if (!formatStarter) {
    throw new Error(
      `Join format starter "${JOIN_FLOW_FORMAT_STARTER.formatStarterSlug}" is not available.`,
    );
  }

  const startingPoint = formatStarter.startingPoints.find(
    (entry) => entry.variantSlug === JOIN_FLOW_FORMAT_STARTER.variantSlug,
  );

  if (!startingPoint) {
    throw new Error(
      `Join format starter "${JOIN_FLOW_FORMAT_STARTER.formatStarterSlug}" does not define variant "${JOIN_FLOW_FORMAT_STARTER.variantSlug}".`,
    );
  }

  return {
    mode: formatStarter.mode,
    slug: formatStarter.slug,
    title: "Try with only public data",
    description:
      "Try Overbase without sharing any of your internal data and with only public data",
    dataSourceIds: formatStarter.dataSourceIds,
    industryTags: formatStarter.industryTags,
    sampleEmail: formatStarter.sampleEmail,
  };
}
