import { type EmailDraft, type EmailDraftPatch } from './email.js';
export declare const PRIMARY_EMAIL_DRAFT_ARTIFACT_ID = "primary";
export type BuilderArtifactVisibility = 'hidden' | 'visible';
export type BuilderEmailDraftArtifact = {
    id: typeof PRIMARY_EMAIL_DRAFT_ARTIFACT_ID;
    kind: 'emailDraft';
    version: number;
    visibility: BuilderArtifactVisibility;
    value: EmailDraft;
};
export type BuilderArtifact = BuilderEmailDraftArtifact;
export type BuilderArtifacts = {
    primary?: BuilderEmailDraftArtifact;
};
export type BuilderEmailDraftArtifactSet = {
    artifactId: typeof PRIMARY_EMAIL_DRAFT_ARTIFACT_ID;
    kind: 'emailDraft';
    visibility: BuilderArtifactVisibility;
    value: EmailDraft;
};
export type BuilderArtifactSet = BuilderEmailDraftArtifactSet;
export type BuilderEmailDraftArtifactPatch = {
    artifactId: typeof PRIMARY_EMAIL_DRAFT_ARTIFACT_ID;
    kind: 'emailDraft';
    patch: EmailDraftPatch | null;
};
export type BuilderArtifactPatch = BuilderEmailDraftArtifactPatch;
export type BuilderArtifactChangeResult = {
    changed: false;
    artifacts: BuilderArtifacts;
} | {
    changed: true;
    artifacts: BuilderArtifacts;
};
export declare function normalizeBuilderArtifacts(artifacts?: BuilderArtifacts | null): BuilderArtifacts;
export declare function createPrimaryEmailDraftArtifact(params: {
    value: EmailDraft;
    version?: number;
    visibility: BuilderArtifactVisibility;
}): BuilderEmailDraftArtifact;
export declare function createPrimaryEmailDraftArtifactSet(params: {
    value: EmailDraft;
    visibility: BuilderArtifactVisibility;
}): BuilderEmailDraftArtifactSet;
export declare function createPrimaryEmailDraftArtifactPatch(params: {
    patch: EmailDraftPatch | null;
}): BuilderEmailDraftArtifactPatch;
export declare function getPrimaryEmailDraftArtifact(artifacts?: BuilderArtifacts | null): BuilderEmailDraftArtifact | null;
export declare function getHiddenPrimaryEmailDraftArtifact(artifacts?: BuilderArtifacts | null): BuilderEmailDraftArtifact | null;
export declare function getVisiblePrimaryEmailDraftArtifact(artifacts?: BuilderArtifacts | null): BuilderEmailDraftArtifact | null;
export declare function applyBuilderArtifactSetEvent(artifacts: BuilderArtifacts | null | undefined, artifactSet: BuilderArtifactSet): BuilderArtifactChangeResult;
export declare function replaceBuilderArtifact(artifacts: BuilderArtifacts | null | undefined, artifact: BuilderArtifact): BuilderArtifacts;
export declare function applyBuilderArtifactPatchEvent(artifacts: BuilderArtifacts | null | undefined, artifactPatch: BuilderArtifactPatch): BuilderArtifactChangeResult;
//# sourceMappingURL=artifacts.d.ts.map