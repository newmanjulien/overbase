import { applyEmailDraftPatch, getEmailDraftChangedFields, normalizeEmailDraft } from './email.js';
export const BUILDER_HOST_APP_STATE_VERSION = 1;
export function createInitialBuilderHostState(appState = { version: BUILDER_HOST_APP_STATE_VERSION, value: {} }) {
    return {
        appState,
        emailDraft: null,
        preparedEmailDraft: null,
        recentEvents: []
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
function appendRecentEvent(recentEvents, event) {
    return [...recentEvents, event].slice(-5);
}
export function applyBuilderHostEvent(state, event, options = {}) {
    let nextState = state;
    const effects = createEmptyBuilderHostEffects();
    const now = options.now ?? Date.now();
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
    if (event.type === 'emailDraftReplace') {
        const emailDraft = normalizeEmailDraft(event.emailDraft);
        const visible = event.visible !== false;
        nextState = {
            ...nextState,
            preparedEmailDraft: emailDraft,
            ...(visible ? { emailDraft } : {})
        };
        return { state: nextState, effects };
    }
    if (event.type === 'emailDraftPatch') {
        if (!nextState.emailDraft || !event.patch || event.patchIntent !== 'meaningful') {
            return { state: nextState, effects };
        }
        const emailDraft = applyEmailDraftPatch(nextState.emailDraft, event.patch);
        const changedFields = getEmailDraftChangedFields(nextState.emailDraft, emailDraft);
        if (changedFields.length === 0) {
            return { state: nextState, effects };
        }
        nextState = {
            ...nextState,
            emailDraft,
            preparedEmailDraft: emailDraft,
            recentEvents: appendRecentEvent(nextState.recentEvents, {
                summary: 'Runtime applied email draft patch.',
                changedFields,
                createdAt: now
            })
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
export function applyBuilderHostEvents(state, events, options = {}) {
    let nextState = state;
    const effects = createEmptyBuilderHostEffects();
    for (const event of events) {
        const reduction = applyBuilderHostEvent(nextState, event, options);
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