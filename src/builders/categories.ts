export const builderCategories = [
	{
		slug: 'consulting',
		label: 'Consulting',
		iconId: 'briefcase-business',
		sortOrder: 0
	},
	{
		slug: 'law',
		label: 'Law',
		iconId: 'scale',
		sortOrder: 10
	}
] as const;

export type BuilderCategory = (typeof builderCategories)[number];
