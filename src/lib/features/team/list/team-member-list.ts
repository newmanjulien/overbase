import type { SelectableListItem } from '$lib/components/list-page';

export type TeamMemberItem = SelectableListItem & {
	email: string;
};
