import {
	isFormatStarterIndustryTagId,
	listFormatStarterGalleryEntries,
	type FormatStarterGalleryEntry
} from '$lib/features/format-starters/catalog';
import type { SupportedCompanyIndustryId } from '$domain/company-industries';

const JOIN_FORMAT_STARTER_BY_INDUSTRY = {
	insurance: 'whitespace-analysis',
	law: 'warm-up',
	finance: 'finance-whitespace-analysis',
	consulting: 'pitch-context',
	'tech-consulting': 'tech-consulting-call-intelligence'
} satisfies Record<SupportedCompanyIndustryId, string>;

export type JoinFormatStarterRecommendation = FormatStarterGalleryEntry;

export function getJoinFormatStarterRecommendation(
	industryId: string | null | undefined
): JoinFormatStarterRecommendation | null {
	if (!industryId || !isFormatStarterIndustryTagId(industryId)) {
		return null;
	}

	const formatStarter = getJoinFormatStarter(JOIN_FORMAT_STARTER_BY_INDUSTRY[industryId]);

	if (!formatStarter.industryTags.includes(industryId)) {
		throw new Error(
			`Join format starter "${formatStarter.slug}" is not tagged for industry "${industryId}".`
		);
	}

	return formatStarter;
}

function getJoinFormatStarter(formatStarterSlug: string) {
	const galleryEntries = listFormatStarterGalleryEntries();
	const formatStarter = galleryEntries.find((entry) => entry.slug === formatStarterSlug);

	if (!formatStarter) {
		throw new Error(`Join format starter "${formatStarterSlug}" is not available.`);
	}

	if (formatStarter.mode === 'public-data') {
		throw new Error(`Join format starter "${formatStarterSlug}" cannot use public data.`);
	}

	return formatStarter;
}
