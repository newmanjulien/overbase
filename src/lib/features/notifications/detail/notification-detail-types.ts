import type { EmailDraft } from '@overbase/builder-sdk/email';

export type NotificationRule = {
	id: string;
	text: string;
};

export type NotificationEmailItem = {
	id: string;
	sentAt: string;
	draft: EmailDraft;
};
