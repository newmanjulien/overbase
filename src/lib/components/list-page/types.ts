import type { PhosphorIcon } from '$lib/components/icons/types';
import type { InlineTextContent } from '$lib/components/ui/inline-text';

export type ListIcon = PhosphorIcon;

export type ListToolbarConfig = {
	searchPlaceholder?: string;
	searchAriaLabel?: string;
	searchValue?: string;
	onSearchValueChange?: (value: string) => void;
	filter?: ListFilterConfig;
	actionLabel?: string;
	onAction?: () => void;
};

export type ListFilterConfig = {
	label: string;
	selectedId: string;
	options: ListFilterOption[];
	onSelect: (optionId: string) => void;
};

export type ListFilterOption = {
	id: string;
	label: string;
};

export type EmptyListNextStepsPart =
	| {
			kind: 'text';
			text: string;
	  }
	| {
			kind: 'link';
			text: string;
			href: `/${string}`;
	  };

export type EmptyListNextStepsContent = string | readonly EmptyListNextStepsPart[];

export type EmptyListStateConfig = {
	title: string;
	description: InlineTextContent;
	nextSteps?: EmptyListNextStepsContent;
	learnMoreLabel?: string;
	actionLabel?: string;
	actionHelpText?: string;
	actionHelpTooltipText?: string;
	onAction?: () => void;
	icon?: ListIcon;
};

export type SelectableListItem = {
	id: string;
	href?: `/${string}`;
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
	disabled?: boolean | ((selectedItemIds: string[]) => boolean);
	onSelect: (selectedItemIds: string[]) => void | Promise<void>;
};
