import { applyEmailDraftPatch, hasEmailDraftChanged, hasEmailDraftPatchFields, normalizeEmailDraft } from './email.js';
export const PRIMARY_EMAIL_DRAFT_ARTIFACT_ID = 'primary';
export function normalizeBuilderArtifacts(artifacts) {
    const artifact = artifacts?.primary;
    if (!artifact) {
        return {};
    }
    return {
        primary: {
            id: PRIMARY_EMAIL_DRAFT_ARTIFACT_ID,
            kind: 'emailDraft',
            version: artifact.version,
            visibility: artifact.visibility,
            value: normalizeEmailDraft(artifact.value)
        }
    };
}
export function createPrimaryEmailDraftArtifact(params) {
    return {
        id: PRIMARY_EMAIL_DRAFT_ARTIFACT_ID,
        kind: 'emailDraft',
        version: params.version ?? 1,
        visibility: params.visibility,
        value: normalizeEmailDraft(params.value)
    };
}
export function createPrimaryEmailDraftArtifactSet(params) {
    return {
        artifactId: PRIMARY_EMAIL_DRAFT_ARTIFACT_ID,
        kind: 'emailDraft',
        visibility: params.visibility,
        value: normalizeEmailDraft(params.value)
    };
}
export function createPrimaryEmailDraftArtifactPatch(params) {
    return {
        artifactId: PRIMARY_EMAIL_DRAFT_ARTIFACT_ID,
        kind: 'emailDraft',
        patch: params.patch
    };
}
export function getPrimaryEmailDraftArtifact(artifacts) {
    const artifact = artifacts?.primary;
    return artifact?.kind === 'emailDraft' ? artifact : null;
}
export function getHiddenPrimaryEmailDraftArtifact(artifacts) {
    const artifact = getPrimaryEmailDraftArtifact(artifacts);
    return artifact?.visibility === 'hidden' ? artifact : null;
}
export function getVisiblePrimaryEmailDraftArtifact(artifacts) {
    const artifact = getPrimaryEmailDraftArtifact(artifacts);
    return artifact?.visibility === 'visible' ? artifact : null;
}
export function applyBuilderArtifactSetEvent(artifacts, artifactSet) {
    const normalizedArtifacts = normalizeBuilderArtifacts(artifacts);
    const currentArtifact = normalizedArtifacts.primary;
    return {
        changed: true,
        artifacts: {
            ...normalizedArtifacts,
            primary: {
                id: PRIMARY_EMAIL_DRAFT_ARTIFACT_ID,
                kind: 'emailDraft',
                version: (currentArtifact?.version ?? 0) + 1,
                visibility: artifactSet.visibility,
                value: normalizeEmailDraft(artifactSet.value)
            }
        }
    };
}
export function replaceBuilderArtifact(artifacts, artifact) {
    const normalizedArtifacts = normalizeBuilderArtifacts(artifacts);
    return {
        ...normalizedArtifacts,
        primary: {
            ...artifact,
            id: PRIMARY_EMAIL_DRAFT_ARTIFACT_ID,
            kind: 'emailDraft',
            value: normalizeEmailDraft(artifact.value)
        }
    };
}
export function applyBuilderArtifactPatchEvent(artifacts, artifactPatch) {
    const normalizedArtifacts = normalizeBuilderArtifacts(artifacts);
    const artifact = normalizedArtifacts.primary;
    if (!artifact ||
        artifact.kind !== 'emailDraft' ||
        artifact.visibility !== 'visible' ||
        artifactPatch.kind !== 'emailDraft' ||
        !hasEmailDraftPatchFields(artifactPatch.patch)) {
        return {
            changed: false,
            artifacts: normalizedArtifacts
        };
    }
    const value = applyEmailDraftPatch(artifact.value, artifactPatch.patch);
    if (!hasEmailDraftChanged(artifact.value, value)) {
        return {
            changed: false,
            artifacts: normalizedArtifacts
        };
    }
    return {
        changed: true,
        artifacts: {
            ...normalizedArtifacts,
            primary: {
                ...artifact,
                version: artifact.version + 1,
                value
            }
        }
    };
}
//# sourceMappingURL=artifacts.js.map