import {
	createFormatsGalleryHref,
	normalizeCreateFormatsModeFilter,
	type CreateFormatsGalleryHref
} from '$lib/app/app-links';
import {
	FORMAT_STARTER_INDUSTRY_TAGS,
	isFormatStarterIndustryTagId,
	type FormatStarterGalleryEntry,
	type FormatStarterIndustryTagId
} from '$lib/features/format-starters/catalog';

export type CreateFormatGalleryCategoryId = 'public-data' | FormatStarterIndustryTagId;

export type CreateFormatGalleryCategory = {
	id: CreateFormatGalleryCategoryId;
	label: string;
	infoBar: {
		label: string;
		text: string;
	};
};

const INDUSTRY_CATEGORY_INFO_BAR = {
	label: 'Next step:',
	text: 'Select a starter to design an email format your team will receive'
};

const PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY_ID = 'public-data';

const PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY = {
	id: PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY_ID,
	label: 'Public data',
	infoBar: {
		label: 'Tip:',
		text:
			'These are for testing Overbase with public data - use the dropdown to see starters for your industry'
	}
} satisfies CreateFormatGalleryCategory;

const CREATE_FORMAT_GALLERY_INDUSTRY_CATEGORIES = FORMAT_STARTER_INDUSTRY_TAGS.map((tag) => ({
	id: tag.id,
	label: tag.label,
	infoBar: INDUSTRY_CATEGORY_INFO_BAR
})) satisfies readonly CreateFormatGalleryCategory[];

export const CREATE_FORMAT_GALLERY_CATEGORIES = [
	PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY,
	...CREATE_FORMAT_GALLERY_INDUSTRY_CATEGORIES
] satisfies readonly CreateFormatGalleryCategory[];

export function getCreateFormatGalleryCategoryById(
	categoryId: string | null | undefined
): CreateFormatGalleryCategory | null {
	return CREATE_FORMAT_GALLERY_CATEGORIES.find((category) => category.id === categoryId) ?? null;
}

export function getCreateFormatGalleryDropdownCategories(
	workspaceIndustryId: string | null | undefined
): readonly CreateFormatGalleryCategory[] {
	return [
		...CREATE_FORMAT_GALLERY_INDUSTRY_CATEGORIES.filter(
			(category) => category.id === workspaceIndustryId
		),
		...CREATE_FORMAT_GALLERY_INDUSTRY_CATEGORIES.filter(
			(category) => category.id !== workspaceIndustryId
		),
		PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY
	];
}

export function getCreateFormatGalleryCategoryFromSearchParams(
	searchParams: URLSearchParams,
	fallbackCategoryId?: string | null
): CreateFormatGalleryCategory {
	const selectedMode = normalizeCreateFormatsModeFilter(searchParams.get('mode'));
	const selectedIndustry = normalizeCreateFormatsIndustryFilter(searchParams.get('industry'));

	if (selectedMode === 'public-data') {
		return PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY;
	}

	if (selectedMode !== 'all') {
		return PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY;
	}

	if (selectedIndustry !== 'all') {
		return (
			getCreateFormatGalleryCategoryById(selectedIndustry) ??
			PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY
		);
	}

	if (searchParams.has('mode') || searchParams.has('industry')) {
		return PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY;
	}

	return (
		getCreateFormatGalleryCategoryById(fallbackCategoryId) ??
		PUBLIC_DATA_CREATE_FORMAT_GALLERY_CATEGORY
	);
}

export function createFormatGalleryCategoryHref(
	category: CreateFormatGalleryCategory
): CreateFormatsGalleryHref {
	if (category.id === 'public-data') {
		return createFormatsGalleryHref({ mode: 'public-data' });
	}

	return createFormatsGalleryHref({ industry: category.id });
}

export function matchesCreateFormatGalleryCategory(
	formatStarter: FormatStarterGalleryEntry,
	category: CreateFormatGalleryCategory
) {
	if (category.id === 'public-data') {
		return formatStarter.mode === 'public-data';
	}

	return formatStarter.mode !== 'public-data' && formatStarter.industryTags.includes(category.id);
}

function normalizeCreateFormatsIndustryFilter(
	value: string | null | undefined
): 'all' | FormatStarterIndustryTagId {
	return value && isFormatStarterIndustryTagId(value) ? value : 'all';
}
