import type { SelectableListItem } from '$lib/components/list-page';

export type OpportunityFormatListItem = SelectableListItem & {
	title: string;
	statusLabel: string;
	statusLabelClass: string;
	createdAtLabel: string;
	creator: {
		name: string;
		avatar: string;
	};
};
