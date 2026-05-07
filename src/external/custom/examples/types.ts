import type { EmailDraft } from '@overbase/builder-sdk/email';

export type CustomEmailExamples = {
	slug: string;
	description: string;
	questionGuidance: string;
	examples: CustomEmailExample[];
};

export type CustomEmailExample = {
	slug: string;
	description: string;
	matchSignals: string[];
	emailDraft: EmailDraft;
};
