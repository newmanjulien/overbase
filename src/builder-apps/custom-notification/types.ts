import type { EmailDraft } from '@overbase/builder-sdk/email';

export type { BuilderAppManifest } from '@overbase/builder-sdk/catalog';
export type {
	ChatReplyDeltaHandler,
	ChatReplyStreamHandlers,
	EmailBuilderEventContext,
	EmailBuilderTurnStreamHandlers,
	EmailBuilderTurnStreamResult,
	TranscriptMessage
} from '@overbase/builder-sdk/streams';

export type EmailExamplesCandidate = {
	slug: string;
	description: string;
	questionGuidance: string;
};

export type EmailExampleCandidate = {
	slug: string;
	description: string;
	matchSignals: string[];
	emailDraft: EmailDraft;
};

export type EmailRouteResult = {
	examplesSlug: string;
	question: string;
};

export type EmailAdaptedExampleResult = {
	exampleSlug: string;
	emailDraft: EmailDraft;
};
