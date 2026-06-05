import { SUPPORTED_COMPANY_INDUSTRIES } from '../company-industries';

export const CREATE_FORMAT_GALLERY_CATEGORY_IDS = [
	'public-data',
	...SUPPORTED_COMPANY_INDUSTRIES.map((industry) => industry.id)
] as const;

export type CreateFormatGalleryCategoryId = (typeof CREATE_FORMAT_GALLERY_CATEGORY_IDS)[number];

export function isCreateFormatGalleryCategoryId(
	value: string
): value is CreateFormatGalleryCategoryId {
	return CREATE_FORMAT_GALLERY_CATEGORY_IDS.some((categoryId) => categoryId === value);
}
