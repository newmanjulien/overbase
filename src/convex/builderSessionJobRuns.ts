import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction } from './_generated/server';
import { getBuilderAppRuntime } from './builderRuntime';
import {
	ASSISTANT_STREAM_FLUSH_INTERVAL_MS,
	ASSISTANT_STREAM_FLUSH_MIN_CHARS,
	getErrorMessage
} from './builderSessionCore';

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

			let pendingText = '';
			let lastFlushAt = Date.now();
			const events = await runtime.startTurn({
				setup: context.setup,
				appState: context.appState,
				handlers: {
					onAssistantDelta: async (delta) => {
						pendingText += delta;
						const now = Date.now();

						if (
							pendingText.length >= ASSISTANT_STREAM_FLUSH_MIN_CHARS ||
							now - lastFlushAt >= ASSISTANT_STREAM_FLUSH_INTERVAL_MS
						) {
							const deltaToFlush = pendingText;
							pendingText = '';
							lastFlushAt = now;
							await ctx.runMutation(internal.builderSessionJobs.appendAssistantMessageDelta, {
								jobId,
								delta: deltaToFlush
							});
						}
					}
				}
			});

			if (pendingText) {
				await ctx.runMutation(internal.builderSessionJobs.appendAssistantMessageDelta, {
					jobId,
					delta: pendingText
				});
			}

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

			let pendingText = '';
			let lastFlushAt = Date.now();
			const events = await runtime.continueTurn({
				setup: claim.setup,
				userMessage: claim.userMessage,
				transcript: claim.transcript,
				emailDraftState: claim.emailDraftState,
				appState: claim.appState,
				handlers: {
					onAssistantDelta: async (delta) => {
						pendingText += delta;
						const now = Date.now();

						if (
							pendingText.length >= ASSISTANT_STREAM_FLUSH_MIN_CHARS ||
							now - lastFlushAt >= ASSISTANT_STREAM_FLUSH_INTERVAL_MS
						) {
							const deltaToFlush = pendingText;
							pendingText = '';
							lastFlushAt = now;
							await ctx.runMutation(internal.builderSessionJobs.appendAssistantMessageDelta, {
								jobId,
								delta: deltaToFlush
							});
						}
					}
				}
			});

			if (pendingText) {
				await ctx.runMutation(internal.builderSessionJobs.appendAssistantMessageDelta, {
					jobId,
					delta: pendingText
				});
			}

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

			const events = await runtime.backgroundJob({
				setup: context.setup,
				appState: context.appState
			});

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
