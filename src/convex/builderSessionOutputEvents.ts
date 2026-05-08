import type { EmailDraft, EmailDraftPatch } from '@overbase/builder-sdk/email';
import type { BuilderAppOutputEvent } from '@overbase/builder-sdk/app-protocol';
import {
	applyEmailDraftPatch,
	hasEmailDraftChanged,
	normalizeEmailDraft
} from '@overbase/builder-sdk/email';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import { completeJobRecord, normalizeAssistantText } from './builderSessionCore';
import { mergeBuilderSessionAppState } from './builderSessionAppState';

type SessionPatch = {
	status?: Doc<'builderSessions'>['status'];
	emailDraftVersion?: number;
	preparedEmailDraft?: EmailDraft;
	emailDraft?: EmailDraft;
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
	currentDraft: EmailDraft | null | undefined;
	patch: EmailDraftPatch | null;
	patchIntent: 'none' | 'noop' | 'meaningful';
}) {
	if (
		!params.currentDraft ||
		params.patchIntent !== 'meaningful' ||
		!params.patch ||
		params.patch.operations.length === 0
	) {
		return {
			nextDraft: null,
			emailDraftChanged: false
		};
	}

	const patchedDraft = applyEmailDraftPatch(params.currentDraft, params.patch);

	return hasEmailDraftChanged(params.currentDraft, patchedDraft)
		? {
				nextDraft: patchedDraft,
				emailDraftChanged: true
			}
		: {
				nextDraft: null,
				emailDraftChanged: false
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
	let emailDraftChanged = false;
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

		if (event.type === 'emailDraftReplace') {
			const nextDraft = normalizeEmailDraft(event.emailDraft);
			const isVisible = event.visible !== false;
			const nextEmailDraftVersion = isVisible
				? Math.max(1, (sessionPatch.emailDraftVersion ?? session.emailDraftVersion) + 1)
				: (sessionPatch.emailDraftVersion ?? session.emailDraftVersion);

			sessionPatch = {
				...sessionPatch,
				emailDraftVersion: nextEmailDraftVersion,
				preparedEmailDraft: nextDraft,
				...(isVisible ? { emailDraft: nextDraft } : {})
			};
			emailDraftChanged = true;
			continue;
		}

		if (event.type === 'emailDraftPatch') {
			const currentDraft = sessionPatch.emailDraft ?? session.emailDraft;
			const patchOutput = resolveEmailDraftPatchOutput({
				currentDraft,
				patch: event.patch,
				patchIntent: event.patchIntent
			});

			if (patchOutput.nextDraft) {
				sessionPatch = {
					...sessionPatch,
					emailDraftVersion: sessionPatch.emailDraftVersion ?? session.emailDraftVersion + 1,
					emailDraft: patchOutput.nextDraft,
					preparedEmailDraft: patchOutput.nextDraft
				};
				emailDraftChanged = true;
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
		emailDraftChanged,
		emailDraft: sessionPatch.emailDraft ?? session.emailDraft ?? null
	};
}
