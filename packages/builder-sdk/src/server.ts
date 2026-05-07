import type { EmailDraft } from './email.js';
import type { GuidedEmailAppCatalogDefinition } from './catalog.js';
import type {
	EmailBuilderEventContext,
	EmailBuilderTurnStreamHandlers,
	EmailBuilderTurnStreamResult,
	TranscriptMessage
} from './streams.js';

export * from './openai.js';
export * from './streams.js';

export type InitialDraftParams = {
	initialMessage: string;
};

export type RefinementParams = {
	transcript: TranscriptMessage[];
	draft: EmailDraft;
	recentEvents: EmailBuilderEventContext[];
	handlers: EmailBuilderTurnStreamHandlers;
};

export type EmailAppDefinition = GuidedEmailAppCatalogDefinition & {
	createInitialDraft: (params: InitialDraftParams) => Promise<EmailDraft>;
	streamRefinementTurn: (params: RefinementParams) => Promise<EmailBuilderTurnStreamResult>;
};
