import type { Database } from 'lucide-svelte';

export type ResourceIcon = typeof Database;

export type ResourceToolbarConfig = {
	searchPlaceholder: string;
	searchAriaLabel?: string;
	filterLabel?: string;
	actionLabel?: string;
};

export type ResourceEmptyStateConfig = {
	title: string;
	description: string;
	details?: string;
	learnMoreLabel?: string;
	actionLabel?: string;
	icon?: ResourceIcon;
};
