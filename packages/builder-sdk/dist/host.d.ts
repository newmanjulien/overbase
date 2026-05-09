import type { BuilderAppBackgroundJobInput, BuilderAppContinueTurnInput, BuilderAppOutputEvent, BuilderAppStartTurnInput, BuilderAppState } from './app-protocol.js';
import type { BuilderAppManifest } from './catalog.js';
import { type EmailDraftState } from './email.js';
export type BuilderAppRuntime = {
    manifest: BuilderAppManifest;
    startTurn: (input: BuilderAppStartTurnInput, emit?: (event: BuilderAppOutputEvent) => Promise<void> | void) => Promise<BuilderAppOutputEvent[]>;
    continueTurn: (input: BuilderAppContinueTurnInput, emit?: (event: BuilderAppOutputEvent) => Promise<void> | void) => Promise<BuilderAppOutputEvent[]>;
    backgroundJob?: (input: BuilderAppBackgroundJobInput) => Promise<BuilderAppOutputEvent[]>;
};
export type BuilderHostState = {
    appState: BuilderAppState;
    emailDraftState: EmailDraftState | null;
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
export declare const BUILDER_HOST_APP_STATE_VERSION = 1;
export declare function createInitialBuilderHostState(appState?: BuilderAppState): BuilderHostState;
export declare function createEmptyBuilderHostEffects(): BuilderHostEffects;
export declare function patchBuilderHostAppState(appState: BuilderAppState, patch: Record<string, unknown>): BuilderAppState;
export declare function applyBuilderHostEvent(state: BuilderHostState, event: BuilderAppOutputEvent): BuilderHostReduction;
export declare function applyBuilderHostEvents(state: BuilderHostState, events: BuilderAppOutputEvent[]): BuilderHostReduction;
//# sourceMappingURL=host.d.ts.map