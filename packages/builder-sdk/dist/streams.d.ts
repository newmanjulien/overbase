import type { EmailDraftPatch } from './email.js';
export type TranscriptMessage = {
    role: 'user' | 'assistant';
    text: string;
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
};
export declare function readOpenAIStream(response: Response, handlers: ChatReplyStreamHandlers): Promise<string>;
export declare function readEmailBuilderTurnStream(response: Response, handlers: EmailBuilderTurnStreamHandlers): Promise<EmailBuilderTurnStreamResult>;
//# sourceMappingURL=streams.d.ts.map