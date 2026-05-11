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

export type SelectableListItem = {
	id: string;
	title: string;
	descriptionLabel?: string;
	metaLabel?: string;
	creator?: {
		name: string;
		avatar: string;
	};
	selectAriaLabel?: string;
	actionsAriaLabel?: string;
	actions?: SelectableListItemAction[];
};

export type SelectableListItemAction = {
	label: string;
	ariaLabel?: string;
	intent?: 'default' | 'destructive';
	disabled?: boolean;
	onSelect: () => void | Promise<void>;
};

export type SelectableListSelectedAction = {
	label: string;
	ariaLabel?: string;
	intent?: 'default' | 'destructive';
	disabled?: boolean;
	onSelect: (selectedItemIds: string[]) => void | Promise<void>;
};
