export const FORMAT_STARTER_INDUSTRY_TAGS = [
	{ id: 'law', label: 'Law' },
	{ id: 'insurance', label: 'Insurance' },
	{ id: 'consulting', label: 'Consulting' }
] as const;

export type FormatStarterIndustryTagId = (typeof FORMAT_STARTER_INDUSTRY_TAGS)[number]['id'];

export function isFormatStarterIndustryTagId(
	value: string
): value is FormatStarterIndustryTagId {
	return FORMAT_STARTER_INDUSTRY_TAGS.some((tag) => tag.id === value);
}
