import type { Database } from 'lucide-svelte';

export type ListIcon = typeof Database;

export type ListToolbarConfig = {
	searchPlaceholder: string;
	searchAriaLabel?: string;
	filterLabel?: string;
	actionLabel?: string;
};

export type EmptyListStateConfig = {
	title: string;
	description: string;
	details?: string;
	learnMoreLabel?: string;
	actionLabel?: string;
	icon?: ListIcon;
};
