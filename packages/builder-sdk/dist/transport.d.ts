import type { BuilderAppBackgroundJobInput, BuilderAppContinueTurnInput, BuilderAppFinalEvent, BuilderAppOutputEvent, BuilderAppStartTurnInput, BuilderRuntimeContext, BuilderRuntimeStreamEvent } from './app-protocol.js';
export declare const BUILDER_RUNTIME_ROUTES: {
    readonly manifest: "manifest";
    readonly startTurn: "start-turn";
    readonly continueTurn: "continue-turn";
    readonly backgroundJob: "background-job";
};
export type BuilderRuntimeRoute = (typeof BUILDER_RUNTIME_ROUTES)[Exclude<keyof typeof BUILDER_RUNTIME_ROUTES, 'manifest'>];
export type BuilderRuntimeInput = BuilderAppStartTurnInput | BuilderAppContinueTurnInput | BuilderAppBackgroundJobInput;
export type BuilderRuntimeEventHandler = (event: BuilderAppOutputEvent) => Promise<void> | void;
export type BuilderRuntimeStreamEventHandler = (event: BuilderRuntimeStreamEvent) => Promise<void> | void;
export declare const BUILDER_RUNTIME_HEADERS: {
    readonly app: "x-overbase-app";
    readonly timestamp: "x-overbase-timestamp";
    readonly signature: "x-overbase-signature";
};
export declare const BUILDER_RUNTIME_MAX_CLOCK_SKEW_MS: number;
type SignedRuntimeOptions = {
    secret: string | undefined;
    expectedAppSlug: string;
    maxClockSkewMs?: number;
    now?: number;
};
export declare function signaturesEqual(left: string, right: string): boolean;
export declare function createBuilderRuntimeSignature(params: {
    secret: string;
    timestamp: string;
    body: string;
}): Promise<string>;
export declare function verifyBuilderRuntimeSignature(params: {
    headers: Headers;
    body: string;
    secret: string | undefined;
    expectedAppSlug: string;
    maxClockSkewMs?: number;
    now?: number;
}): Promise<"Invalid app." | "Invalid timestamp." | "Invalid signature." | null>;
export declare function readBuilderRuntimeEvents(response: Response, onEvent?: BuilderRuntimeEventHandler): Promise<BuilderAppOutputEvent[]>;
export declare function streamBuilderRuntimeEvents(run: (context: BuilderRuntimeContext) => Promise<BuilderAppFinalEvent[]>): Promise<Response>;
export declare function callBuilderRuntime(params: {
    fetchImpl?: typeof fetch;
    baseUrl: string;
    secret: string;
    appSlug: string;
    route: BuilderRuntimeRoute;
    input: BuilderRuntimeInput;
    onStreamEvent?: BuilderRuntimeStreamEventHandler;
}): Promise<BuilderAppFinalEvent[]>;
export type BuilderRuntimeRequestEvent = {
    request: Request;
};
export declare function readSignedBuilderRuntimeJson<T>(event: BuilderRuntimeRequestEvent, options: SignedRuntimeOptions): Promise<Response | T>;
export declare function signedBuilderRuntimeRoute<TInput>(run: (input: TInput, context: BuilderRuntimeContext) => Promise<BuilderAppFinalEvent[]>, options: SignedRuntimeOptions): (event: BuilderRuntimeRequestEvent) => Promise<Response>;
export {};
//# sourceMappingURL=transport.d.ts.map