import { v } from 'convex/values';
import { internalAction, internalMutation } from '../_generated/server';
import { deleteExpiredBuilderSessions } from '../../backend/builder-sessions/deletion';
import {
	runBackgroundJob as runBackgroundJobExecution,
	runContinueTurn as runContinueTurnExecution,
	runStartTurn as runStartTurnExecution
} from '../../backend/builder-sessions/execution';
import {
	appendAssistantMessageDelta as appendAssistantMessageDeltaState,
	claimBackgroundJob as claimBackgroundJobState,
	claimContinueTurn as claimContinueTurnState,
	claimStartTurn as claimStartTurnState,
	completeBuilderJob as completeBuilderJobState,
	failBuilderJob as failBuilderJobState
} from '../../backend/builder-sessions/job-state';
import { builderAppOutputEvent } from '../../backend/validators/builder-protocol';

export const appendAssistantMessageDelta = internalMutation({
	args: {
		jobId: v.id('builderSessionJobs'),
		delta: v.string()
	},
	handler: async (ctx, args) => await appendAssistantMessageDeltaState(ctx, args)
});

export const claimStartTurn = internalMutation({
	args: {
		jobId: v.id('builderSessionJobs')
	},
	handler: async (ctx, { jobId }) => await claimStartTurnState(ctx, jobId)
});

export const claimContinueTurn = internalMutation({
	args: {
		jobId: v.id('builderSessionJobs')
	},
	handler: async (ctx, { jobId }) => await claimContinueTurnState(ctx, jobId)
});

export const claimBackgroundJob = internalMutation({
	args: {
		jobId: v.id('builderSessionJobs')
	},
	handler: async (ctx, { jobId }) => await claimBackgroundJobState(ctx, jobId)
});

export const completeBuilderJob = internalMutation({
	args: {
		jobId: v.id('builderSessionJobs'),
		events: v.array(builderAppOutputEvent)
	},
	handler: async (ctx, args) => await completeBuilderJobState(ctx, args)
});

export const failBuilderJob = internalMutation({
	args: {
		jobId: v.id('builderSessionJobs'),
		errorText: v.string()
	},
	handler: async (ctx, args) => await failBuilderJobState(ctx, args)
});

export const runStartTurn = internalAction({
	args: {
		jobId: v.id('builderSessionJobs')
	},
	handler: async (ctx, { jobId }) => await runStartTurnExecution(ctx, jobId)
});

export const runContinueTurn = internalAction({
	args: {
		jobId: v.id('builderSessionJobs')
	},
	handler: async (ctx, { jobId }) => await runContinueTurnExecution(ctx, jobId)
});

export const runBackgroundJob = internalAction({
	args: {
		jobId: v.id('builderSessionJobs')
	},
	handler: async (ctx, { jobId }) => await runBackgroundJobExecution(ctx, jobId)
});

export const deleteExpiredSessions = internalMutation({
	args: {},
	handler: async (ctx) => await deleteExpiredBuilderSessions(ctx)
});
