import type { EmailDraftPatch, EmailDraftState } from '@overbase/builder-sdk/email';
import type { BuilderAppOutputEvent } from '@overbase/builder-sdk/app-protocol';
import {
	applyEmailDraftPatch,
	hasEmailDraftPatchFields,
	hasEmailDraftChanged,
	normalizeEmailDraft
} from '@overbase/builder-sdk/email';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import { completeJobRecord, normalizeAssistantText } from './builderSessionCore';
import { mergeBuilderSessionAppState } from './builderSessionAppState';

type SessionPatch = {
	status?: Doc<'builderSessions'>['status'];
	emailDraftState?: EmailDraftState;
	activeTurnJobId?: Id<'builderSessionJobs'> | undefined;
	activeBackgroundJobId?: Id<'builderSessionJobs'> | undefined;
	errorText?: string | undefined;
	appState?: { version: number; value: unknown };
};

export type BuilderSessionOutputEvent =
	| BuilderAppOutputEvent
	| {
			type: 'sessionPatch';
			patch: SessionPatch;
	  }
	| {
			type: 'completeJob';
	  };

export function resolveEmailDraftPatchOutput(params: {
	currentState: EmailDraftState | null | undefined;
	patch: EmailDraftPatch | null;
}) {
	if (
		!params.currentState ||
		params.currentState.visibility !== 'visible' ||
		!hasEmailDraftPatchFields(params.patch)
	) {
		return null;
	}

	const patchedDraft = applyEmailDraftPatch(params.currentState.draft, params.patch);

	if (!hasEmailDraftChanged(params.currentState.draft, patchedDraft)) {
		return null;
	}

	return {
		version: params.currentState.version + 1,
		visibility: 'visible' as const,
		draft: patchedDraft
	};
}

export async function applyBuilderSessionOutputEvents(
	ctx: MutationCtx,
	{
		job,
		session,
		events,
		now
	}: {
		job: Doc<'builderSessionJobs'>;
		session: Doc<'builderSessions'>;
		events: BuilderSessionOutputEvent[];
		now: number;
	}
) {
	let sessionPatch: SessionPatch = {};
	let shouldCompleteJob = false;

	for (const event of events) {
		if (
			event.type === 'assistantDelta' ||
			event.type === 'enqueueBackgroundJob' ||
			event.type === 'waitForUser' ||
			event.type === 'complete'
		) {
			continue;
		}

		if (event.type === 'fail') {
			throw new Error(event.errorText);
		}

		if (event.type === 'assistantComplete') {
			const assistantText = normalizeAssistantText(event.text);

			if (!assistantText) {
				throw new Error('Assistant response was empty.');
			}

			if (job.assistantMessageId) {
				await ctx.db.patch(job.assistantMessageId, {
					text: assistantText,
					status: 'complete',
					updatedAt: now
				});
			}
			continue;
		}

		if (event.type === 'emailDraftSet') {
			const nextDraft = normalizeEmailDraft(event.emailDraft);
			const currentVersion =
				sessionPatch.emailDraftState?.version ?? session.emailDraftState?.version ?? 0;

			sessionPatch = {
				...sessionPatch,
				emailDraftState: {
					version: currentVersion + 1,
					visibility: event.visibility,
					draft: nextDraft
				}
			};
			continue;
		}

		if (event.type === 'emailDraftPatch') {
			const currentState = sessionPatch.emailDraftState ?? session.emailDraftState;
			const nextState = resolveEmailDraftPatchOutput({
				currentState,
				patch: event.patch
			});

			if (nextState) {
				sessionPatch = {
					...sessionPatch,
					emailDraftState: nextState
				};
			}
			continue;
		}

		if (event.type === 'appStateReplace') {
			sessionPatch = {
				...sessionPatch,
				appState: event.appState
			};
			continue;
		}

		if (event.type === 'appStatePatch') {
			sessionPatch = {
				...sessionPatch,
				appState: mergeBuilderSessionAppState(
					{ appState: sessionPatch.appState ?? session.appState },
					event.patch
				)
			};
			continue;
		}

		if (event.type === 'sessionPatch') {
			sessionPatch = {
				...sessionPatch,
				...event.patch
			};
			continue;
		}

		shouldCompleteJob = true;
	}

	if (shouldCompleteJob) {
		await completeJobRecord(ctx, job, now);
	}

	if (Object.keys(sessionPatch).length > 0) {
		await ctx.db.patch(session._id, {
			...sessionPatch,
			updatedAt: now
		});
	}

	return {
		emailDraft:
			(sessionPatch.emailDraftState ?? session.emailDraftState)?.visibility === 'visible'
				? (sessionPatch.emailDraftState ?? session.emailDraftState)?.draft ?? null
				: null
	};
}
