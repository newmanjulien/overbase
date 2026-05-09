import type { BuilderAppBackgroundJobInput, BuilderAppContinueTurnInput, BuilderAppOutputEvent, BuilderAppStartTurnInput, BuilderAppState } from './app-protocol.js';
import type { BuilderAppManifest } from './catalog.js';
import { type EmailDraft } from './email.js';
import type { EmailBuilderEventContext } from './streams.js';
export type BuilderAppRuntime = {
    manifest: BuilderAppManifest;
    startTurn: (input: BuilderAppStartTurnInput, emit?: (event: BuilderAppOutputEvent) => Promise<void> | void) => Promise<BuilderAppOutputEvent[]>;
    continueTurn: (input: BuilderAppContinueTurnInput, emit?: (event: BuilderAppOutputEvent) => Promise<void> | void) => Promise<BuilderAppOutputEvent[]>;
    backgroundJob?: (input: BuilderAppBackgroundJobInput) => Promise<BuilderAppOutputEvent[]>;
};
export type BuilderHostState = {
    appState: BuilderAppState;
    emailDraft: EmailDraft | null;
    preparedEmailDraft: EmailDraft | null;
    recentEvents: EmailBuilderEventContext[];
};
export type BuilderHostEffects = {
    assistantCompleteText: string | null;
    enqueueBackgroundJob: boolean;
    waitForUser: boolean;
    complete: boolean;
    errorText: string | null;
};
export type BuilderHostReduction = {
    state: BuilderHostState;
    effects: BuilderHostEffects;
};
export type ApplyBuilderHostEventOptions = {
    now?: number;
};
export declare const BUILDER_HOST_APP_STATE_VERSION = 1;
export declare function createInitialBuilderHostState(appState?: BuilderAppState): BuilderHostState;
export declare function createEmptyBuilderHostEffects(): BuilderHostEffects;
export declare function patchBuilderHostAppState(appState: BuilderAppState, patch: Record<string, unknown>): BuilderAppState;
export declare function applyBuilderHostEvent(state: BuilderHostState, event: BuilderAppOutputEvent, options?: ApplyBuilderHostEventOptions): BuilderHostReduction;
export declare function applyBuilderHostEvents(state: BuilderHostState, events: BuilderAppOutputEvent[], options?: ApplyBuilderHostEventOptions): BuilderHostReduction;
//# sourceMappingURL=host.d.ts.map