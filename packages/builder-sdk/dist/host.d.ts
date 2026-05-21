import type { BuilderAppBackgroundJobInput, BuilderAppContinueTurnInput, BuilderAppFinalEvent, BuilderAppOutputEvent, BuilderAppStartTurnInput, BuilderAppState, BuilderRuntimeContext } from './app-protocol.js';
import type { BuilderAppManifest } from './catalog.js';
import { type BuilderArtifacts } from './artifacts.js';
export type BuilderAppRuntime = {
    manifest: BuilderAppManifest;
    startTurn: (input: BuilderAppStartTurnInput, context: BuilderRuntimeContext) => Promise<BuilderAppFinalEvent[]>;
    continueTurn: (input: BuilderAppContinueTurnInput, context: BuilderRuntimeContext) => Promise<BuilderAppFinalEvent[]>;
    backgroundJob?: (input: BuilderAppBackgroundJobInput, context: BuilderRuntimeContext) => Promise<BuilderAppFinalEvent[]>;
};
export type BuilderHostState = {
    appState: BuilderAppState;
    artifacts: BuilderArtifacts;
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
export declare function createInitialBuilderHostState(appState?: BuilderAppState, artifacts?: BuilderArtifacts): BuilderHostState;
export declare function createEmptyBuilderHostEffects(): BuilderHostEffects;
export declare function patchBuilderHostAppState(appState: BuilderAppState, patch: Record<string, unknown>): BuilderAppState;
export declare function applyBuilderHostEvent(state: BuilderHostState, event: BuilderAppOutputEvent): BuilderHostReduction;
export declare function applyBuilderHostEvents(state: BuilderHostState, events: BuilderAppFinalEvent[]): BuilderHostReduction;
//# sourceMappingURL=host.d.ts.map