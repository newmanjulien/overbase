import type { SelectableListItem } from '$lib/components/list-page';

export type TeamMemberItem = SelectableListItem & {
	email: string;
	displayName: string;
	isEditing: boolean;
	nameDraft: string;
	emailDraft: string;
	deleteLabel: string;
	saveLabel: string;
	deleteDisabled: boolean;
	saveDisabled: boolean;
	onEdit: () => void;
	onCancel: () => void;
	onSave: () => void | Promise<void>;
	onDelete: () => void | Promise<void>;
	onNameDraftChange: (name: string) => void;
	onEmailDraftChange: (email: string) => void;
};
