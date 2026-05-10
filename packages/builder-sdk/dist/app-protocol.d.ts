import type { EmailDraft, EmailDraftPatch, EmailDraftState } from './email.js';
import type { TranscriptMessage } from './streams.js';
import type { GuideDefinition } from './catalog.js';
export type { BuilderAppManifest } from './catalog.js';
export type BuilderAppState = {
    version: number;
    value: unknown;
};
export type BuilderGuideSetupAction = 'submitted' | 'skippedRemaining';
export type BuilderGuideSetupAnswer = {
    questionId: string;
    questionTitle: string;
    answer: string;
};
export type BuilderGuideSetup = {
    action: BuilderGuideSetupAction;
    answers: BuilderGuideSetupAnswer[];
};
export type BuilderFreeformRunSetup = {
    kind: 'freeform';
    initialMessage: string;
};
export type BuilderGuidedRunSetup = {
    kind: 'guided';
    initialMessage: string;
    guideSetup: BuilderGuideSetup;
};
export type BuilderRunSetup = BuilderFreeformRunSetup | BuilderGuidedRunSetup;
export type BuilderAppTurnHandlers = {
    onAssistantDelta?: (delta: string) => Promise<void> | void;
};
export type BuilderAppStartTurnInput = {
    setup: BuilderRunSetup;
    appState?: BuilderAppState;
    handlers: BuilderAppTurnHandlers;
};
export type BuilderAppContinueTurnInput = {
    setup: BuilderRunSetup;
    transcript: TranscriptMessage[];
    userMessage: string;
    emailDraftState?: EmailDraftState;
    appState?: BuilderAppState;
    handlers: BuilderAppTurnHandlers;
};
export type BuilderAppBackgroundJobInput = {
    setup: BuilderRunSetup;
    appState?: BuilderAppState;
};
export type CreateGuidedRunSetupInput = {
    title: string;
    description: string;
    guide: GuideDefinition;
    action: BuilderGuideSetupAction;
    answers: BuilderGuideSetupAnswer[];
};
export declare function createFreeformRunSetup(message: string): BuilderFreeformRunSetup;
export declare function createGuidedRunSetup({ title, description, guide, action, answers }: CreateGuidedRunSetupInput): BuilderGuidedRunSetup;
export declare function normalizeBuilderRunSetup(setup: BuilderRunSetup): BuilderRunSetup;
export declare function builderRunSetupsEqual(left: BuilderRunSetup, right: BuilderRunSetup): boolean;
export declare function buildBuilderRunSetupPromptText(setup: BuilderRunSetup): string;
export type BuilderAppPatchResult = {
    text: string;
    patch: EmailDraftPatch | null;
};
export type BuilderAppOutputEvent = {
    type: 'assistantDelta';
    text: string;
} | {
    type: 'assistantComplete';
    text: string;
} | {
    type: 'emailDraftSet';
    emailDraft: EmailDraft;
    visibility: EmailDraftState['visibility'];
} | {
    type: 'emailDraftPatch';
    patch: EmailDraftPatch | null;
} | {
    type: 'appStateReplace';
    appState: BuilderAppState;
} | {
    type: 'appStatePatch';
    patch: Record<string, unknown>;
} | {
    type: 'enqueueBackgroundJob';
} | {
    type: 'waitForUser';
} | {
    type: 'complete';
} | {
    type: 'fail';
    errorText: string;
};
//# sourceMappingURL=app-protocol.d.ts.map