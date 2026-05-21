import { v } from 'convex/values';
import type {
	BuilderAppFinalEvent,
	BuilderRuntimeContext
} from '@overbase/builder-sdk/app-protocol';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { internalAction, type ActionCtx } from './_generated/server';
import { getBuilderAppRuntime } from './builderRuntime';
import {
	ASSISTANT_STREAM_FLUSH_INTERVAL_MS,
	ASSISTANT_STREAM_FLUSH_MIN_CHARS,
	getErrorMessage
} from './builderSessionCore';

async function flushAssistantDelta(
	ctx: ActionCtx,
	jobId: Id<'builderSessionJobs'>,
	delta: string
) {
	await ctx.runMutation(internal.builderSessionJobs.appendAssistantMessageDelta, {
		jobId,
		delta
	});
}

async function runWithAssistantDeltaFlush(
	ctx: ActionCtx,
	jobId: Id<'builderSessionJobs'>,
	run: (context: BuilderRuntimeContext) => Promise<BuilderAppFinalEvent[]>
) {
	let pendingText = '';
	let lastFlushAt = Date.now();
	const events = await run({
		emit: async (event) => {
			pendingText += event.text;
			const now = Date.now();

			if (
				pendingText.length >= ASSISTANT_STREAM_FLUSH_MIN_CHARS ||
				now - lastFlushAt >= ASSISTANT_STREAM_FLUSH_INTERVAL_MS
			) {
				const deltaToFlush = pendingText;
				pendingText = '';
				lastFlushAt = now;
				await flushAssistantDelta(ctx, jobId, deltaToFlush);
			}
		}
	});

	if (pendingText) {
		await flushAssistantDelta(ctx, jobId, pendingText);
	}

	return events;
}

export const runStartTurn = internalAction({
	args: {
		jobId: v.id('builderSessionJobs')
	},
	handler: async (ctx, { jobId }) => {
		try {
			const context = await ctx.runMutation(internal.builderSessionJobs.claimStartTurn, {
				jobId
			});

			if (!context) {
				return;
			}

			const runtime = getBuilderAppRuntime(context.appSlug);

			if (!runtime?.startTurn) {
				throw new Error('This app is unavailable.');
			}

			const events = await runWithAssistantDeltaFlush(ctx, jobId, (runtimeContext) =>
				runtime.startTurn(
					{
						setup: context.setup,
						artifacts: context.artifacts,
						appState: context.appState
					},
					runtimeContext
				)
			);

			await ctx.runMutation(internal.builderSessionJobs.completeBuilderJob, {
				jobId,
				events
			});
		} catch (error) {
			await ctx.runMutation(internal.builderSessionJobs.failBuilderJob, {
				jobId,
				errorText: getErrorMessage(error)
			});
		}
	}
});

export const runContinueTurn = internalAction({
	args: {
		jobId: v.id('builderSessionJobs')
	},
	handler: async (ctx, { jobId }) => {
		try {
			const claim = await ctx.runMutation(internal.builderSessionJobs.claimContinueTurn, {
				jobId
			});

			if (claim.state === 'retry') {
				await ctx.scheduler.runAfter(
					claim.retryAfterMs,
					internal.builderSessionJobRuns.runContinueTurn,
					{
						jobId
					}
				);
				return;
			}

			if (claim.state !== 'ready') {
				return;
			}

			const runtime = getBuilderAppRuntime(claim.appSlug);

			if (!runtime?.continueTurn) {
				throw new Error('This app is unavailable.');
			}

			const events = await runWithAssistantDeltaFlush(ctx, jobId, (runtimeContext) =>
				runtime.continueTurn(
					{
						setup: claim.setup,
						userMessage: claim.userMessage,
						transcript: claim.transcript,
						artifacts: claim.artifacts,
						appState: claim.appState
					},
					runtimeContext
				)
			);

			await ctx.runMutation(internal.builderSessionJobs.completeBuilderJob, {
				jobId,
				events
			});
		} catch (error) {
			await ctx.runMutation(internal.builderSessionJobs.failBuilderJob, {
				jobId,
				errorText: getErrorMessage(error)
			});
		}
	}
});

export const runBackgroundJob = internalAction({
	args: {
		jobId: v.id('builderSessionJobs')
	},
	handler: async (ctx, { jobId }) => {
		try {
			const context = await ctx.runMutation(internal.builderSessionJobs.claimBackgroundJob, {
				jobId
			});

			if (!context) {
				return;
			}

			const runtime = getBuilderAppRuntime(context.appSlug);

			if (!runtime?.backgroundJob) {
				throw new Error('This app is unavailable.');
			}

			const events = await runtime.backgroundJob(
				{
					setup: context.setup,
					artifacts: context.artifacts,
					appState: context.appState
				},
				{
					emit: async () => {}
				}
			);

			await ctx.runMutation(internal.builderSessionJobs.completeBuilderJob, {
				jobId,
				events
			});
		} catch (error) {
			await ctx.runMutation(internal.builderSessionJobs.failBuilderJob, {
				jobId,
				errorText: getErrorMessage(error)
			});
		}
	}
});
