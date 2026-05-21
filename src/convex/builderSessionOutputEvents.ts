import type { BuilderAppOutputEvent } from '@overbase/builder-sdk/app-protocol';
import {
	applyBuilderArtifactPatchEvent,
	applyBuilderArtifactSetEvent,
	type BuilderArtifacts
} from '@overbase/builder-sdk/artifacts';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import { completeJobRecord, normalizeAssistantText } from './builderSessionCore';
import { mergeBuilderSessionAppState } from './builderSessionAppState';

type SessionPatch = {
	status?: Doc<'builderSessions'>['status'];
	artifacts?: BuilderArtifacts;
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

		if (event.type === 'artifactSet') {
			const result = applyBuilderArtifactSetEvent(
				sessionPatch.artifacts ?? session.artifacts,
				event.artifact
			);

			sessionPatch = {
				...sessionPatch,
				artifacts: result.artifacts
			};
			continue;
		}

		if (event.type === 'artifactPatch') {
			const result = applyBuilderArtifactPatchEvent(
				sessionPatch.artifacts ?? session.artifacts,
				event.artifact
			);

			if (result.changed) {
				sessionPatch = {
					...sessionPatch,
					artifacts: result.artifacts
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
}
