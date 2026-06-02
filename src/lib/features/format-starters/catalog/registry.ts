import { formatStarterEntries } from './entries';
import type { FormatStarterGalleryEntry, FormatStarter } from './types';
import { validateFormatStarterCatalog } from './validate-catalog';

const formatStarterDataModeSortOrder = {
	'internal-data': 0,
	'public-data': 1
} satisfies Record<FormatStarter['mode'], number>;

const formatStarterCatalogValidationIssues = validateFormatStarterCatalog(formatStarterEntries);

if (formatStarterCatalogValidationIssues.length > 0) {
	throw new Error(
		`Invalid format starter catalog:\n${formatStarterCatalogValidationIssues
			.map((issue) => `- ${issue.formatStarterSlug ? `${issue.formatStarterSlug}: ` : ''}${issue.message}`)
			.join('\n')}`
	);
}

export function listFormatStarters() {
	return [...formatStarterEntries]
		.filter((formatStarter) => formatStarter.status === 'active')
		.sort(compareFormatStarterCatalogEntries);
}

function compareFormatStarterCatalogEntries(left: FormatStarter, right: FormatStarter) {
	return (
		formatStarterDataModeSortOrder[left.mode] - formatStarterDataModeSortOrder[right.mode] ||
		left.modeSortOrder - right.modeSortOrder
	);
}

export function listFormatStarterGalleryEntries(): FormatStarterGalleryEntry[] {
	return listFormatStarters()
		.filter((formatStarter) => formatStarter.showInGallery)
		.map(({ mode, slug, title, description }) => ({
			mode,
			slug,
			title,
			description
		}));
}

export function getFormatStarter(slug: string) {
	return (
		formatStarterEntries.find((formatStarter) => formatStarter.slug === slug && formatStarter.status === 'active') ?? null
	);
}
