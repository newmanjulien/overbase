import { applyEmailDraftPatch, hasEmailDraftChanged, hasEmailDraftPatchFields, normalizeEmailDraft } from './email.js';
export const BUILDER_HOST_APP_STATE_VERSION = 1;
export function createInitialBuilderHostState(appState = { version: BUILDER_HOST_APP_STATE_VERSION, value: {} }) {
    return {
        appState,
        emailDraftState: null
    };
}
export function createEmptyBuilderHostEffects() {
    return {
        assistantCompleteText: null,
        enqueueBackgroundJob: false,
        waitForUser: false,
        complete: false,
        errorText: null
    };
}
function getAppStateRecord(appState) {
    return appState.value && typeof appState.value === 'object' && !Array.isArray(appState.value)
        ? appState.value
        : {};
}
export function patchBuilderHostAppState(appState, patch) {
    return {
        version: appState.version + 1,
        value: {
            ...getAppStateRecord(appState),
            ...patch
        }
    };
}
export function applyBuilderHostEvent(state, event) {
    let nextState = state;
    const effects = createEmptyBuilderHostEffects();
    if (event.type === 'assistantComplete') {
        effects.assistantCompleteText = event.text;
        return { state: nextState, effects };
    }
    if (event.type === 'appStateReplace') {
        nextState = {
            ...nextState,
            appState: event.appState
        };
        return { state: nextState, effects };
    }
    if (event.type === 'appStatePatch') {
        nextState = {
            ...nextState,
            appState: patchBuilderHostAppState(nextState.appState, event.patch)
        };
        return { state: nextState, effects };
    }
    if (event.type === 'emailDraftSet') {
        const emailDraft = normalizeEmailDraft(event.emailDraft);
        nextState = {
            ...nextState,
            emailDraftState: {
                version: (nextState.emailDraftState?.version ?? 0) + 1,
                visibility: event.visibility,
                draft: emailDraft
            }
        };
        return { state: nextState, effects };
    }
    if (event.type === 'emailDraftPatch') {
        if (!nextState.emailDraftState ||
            nextState.emailDraftState.visibility !== 'visible' ||
            !hasEmailDraftPatchFields(event.patch)) {
            return { state: nextState, effects };
        }
        const emailDraft = applyEmailDraftPatch(nextState.emailDraftState.draft, event.patch);
        if (!hasEmailDraftChanged(nextState.emailDraftState.draft, emailDraft)) {
            return { state: nextState, effects };
        }
        nextState = {
            ...nextState,
            emailDraftState: {
                version: nextState.emailDraftState.version + 1,
                visibility: 'visible',
                draft: emailDraft
            }
        };
        return { state: nextState, effects };
    }
    if (event.type === 'enqueueBackgroundJob') {
        effects.enqueueBackgroundJob = true;
        return { state: nextState, effects };
    }
    if (event.type === 'waitForUser') {
        effects.waitForUser = true;
        return { state: nextState, effects };
    }
    if (event.type === 'complete') {
        effects.complete = true;
        return { state: nextState, effects };
    }
    if (event.type === 'fail') {
        effects.errorText = event.errorText;
        return { state: nextState, effects };
    }
    return { state: nextState, effects };
}
export function applyBuilderHostEvents(state, events) {
    let nextState = state;
    const effects = createEmptyBuilderHostEffects();
    for (const event of events) {
        const reduction = applyBuilderHostEvent(nextState, event);
        nextState = reduction.state;
        effects.assistantCompleteText =
            reduction.effects.assistantCompleteText ?? effects.assistantCompleteText;
        effects.enqueueBackgroundJob =
            effects.enqueueBackgroundJob || reduction.effects.enqueueBackgroundJob;
        effects.waitForUser = effects.waitForUser || reduction.effects.waitForUser;
        effects.complete = effects.complete || reduction.effects.complete;
        effects.errorText = reduction.effects.errorText ?? effects.errorText;
    }
    return {
        state: nextState,
        effects
    };
}
//# sourceMappingURL=host.js.map