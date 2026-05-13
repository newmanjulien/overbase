import type { SelectableListItem } from '$lib/components/list-page';

export type NotificationListItem = SelectableListItem & {
	title: string;
	statusLabel: string;
	statusLabelClass: string;
	createdAtLabel: string;
	creator: {
		name: string;
		avatar: string;
	};
};
