import type { EmailDraft, EmailDraftPatch } from '../../shared/email';

export type TranscriptMessage = {
	role: 'user' | 'assistant';
	text: string;
};

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

export type EmailBuilderEventContext = {
	summary: string;
	changedFields: string[];
	createdAt: number;
};

export type ChatReplyDeltaHandler = (delta: string) => void | Promise<void>;

export type ChatReplyStreamHandlers = {
	onDelta?: ChatReplyDeltaHandler;
};

export type EmailBuilderTurnStreamHandlers = {
	onTextDelta?: ChatReplyDeltaHandler;
};

export type EmailBuilderTurnStreamResult = {
	text: string;
	patch: EmailDraftPatch | null;
	patchIntent: 'none' | 'noop' | 'meaningful';
};
