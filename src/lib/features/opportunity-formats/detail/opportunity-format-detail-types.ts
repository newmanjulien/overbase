import type { EmailDraft } from '@overbase/builder-sdk/email';

export type OpportunityFormatRule = {
	id: string;
	text: string;
};

export type OpportunityItem = {
	id: string;
	sentAt: string;
	draft: EmailDraft;
};
