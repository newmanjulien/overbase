import type { PhosphorIcon } from '$lib/ui/icons';
import type { InlineTextContent } from '$lib/domain/inline-text';
import type { AppHref } from '$lib/app/app-links';

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
	width?: 'default' | 'wide';
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
			href: AppHref;
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

export type ListRowItem = {
	id: string;
	href?: AppHref;
	actionsAriaLabel?: string;
	actions?: ListRowItemAction[];
};

export type ListRowItemAction = {
	label: string;
	ariaLabel?: string;
	intent?: 'default' | 'destructive';
	disabled?: boolean;
	onSelect: () => void | Promise<void>;
};

export type SelectableListItem = ListRowItem & {
	selectAriaLabel?: string;
};

export type SelectableListItemAction = ListRowItemAction;

export type SelectableListSelectedAction = {
	label: string;
	ariaLabel?: string;
	intent?: 'default' | 'destructive';
	disabled?: boolean | ((selectedItemIds: string[]) => boolean);
	onSelect: (selectedItemIds: string[]) => void | Promise<void>;
};
