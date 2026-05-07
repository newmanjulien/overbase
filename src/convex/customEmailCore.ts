import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import {
	isConversationActive,
	verifyResumeToken
} from './conversationCore';

export const ASSISTANT_STREAM_FLUSH_INTERVAL_MS = 150;
export const ASSISTANT_STREAM_FLUSH_MIN_CHARS = 120;
export const EXPIRED_RUN_CLEANUP_LIMIT = 50;
export const INITIAL_ANSWER_RETRY_MS = 500;
export const INITIAL_ANSWER_MAX_ATTEMPTS = 80;
export const OPERATION_DEADLINE_MS = 45_000;

export function createOperationId() {
	return crypto.randomUUID();
}

export function normalizeAssistantText(text: string) {
	return text.trim();
}

export function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : 'Something went wrong.';
}

export async function getAuthorizedRun(
	ctx: QueryCtx | MutationCtx,
	runId: Id<'customEmailRuns'>,
	resumeToken: string,
	now = Date.now()
) {
	const run = await ctx.db.get(runId);

	if (!run || !isConversationActive(run, now)) {
		return null;
	}

	if (!(await verifyResumeToken(run, resumeToken))) {
		return null;
	}

	return run;
}

export async function buildRunSnapshot(
	ctx: QueryCtx | MutationCtx,
	run: Doc<'customEmailRuns'>,
	resumeToken: string
) {
	const messages = await ctx.db
		.query('customEmailMessages')
		.withIndex('by_run_createdAt', (q) => q.eq('runId', run._id))
		.collect();

	return {
			handle: {
				runId: run._id,
				resumeToken,
				blueprintSlug: run.blueprintSlug,
				expiresAt: run.expiresAt
			},
		run,
		messages
	};
}

export async function insertOperation(
	ctx: MutationCtx,
	{
		runId,
		kind,
		createdAt,
		assistantMessageId,
		operationId = createOperationId()
	}: {
		runId: Id<'customEmailRuns'>;
		kind: Doc<'customEmailOperations'>['kind'];
		createdAt: number;
		assistantMessageId?: Id<'customEmailMessages'>;
		operationId?: string;
	}
) {
	await ctx.db.insert('customEmailOperations', {
		runId,
		kind,
		operationId,
		status: 'pending',
		assistantMessageId,
		attempt: 0,
		maxAttempts: INITIAL_ANSWER_MAX_ATTEMPTS,
		deadlineAt: createdAt + OPERATION_DEADLINE_MS,
		createdAt,
		updatedAt: createdAt
	});

	return operationId;
}

export async function getOperationById(ctx: QueryCtx | MutationCtx, operationId: string) {
	return await ctx.db
		.query('customEmailOperations')
		.withIndex('by_operationId', (q) => q.eq('operationId', operationId))
		.unique();
}

export async function completeOperation(
	ctx: MutationCtx,
	operation: Doc<'customEmailOperations'>,
	now: number
) {
	await ctx.db.patch(operation._id, {
		status: 'complete',
		updatedAt: now
	});
}

export async function failOperation(
	ctx: MutationCtx,
	operationId: string,
	errorText: string,
	now: number,
	{
		phase = 'failed',
		artifactVisibility,
		workingArtifactStatus,
		visibleArtifactStatus,
		failAssistantMessage = true,
		clearActiveMessageOperation = true,
		clearActiveArtifactOperation = true,
		writeRunError = true
	}: {
		phase?: Doc<'customEmailRuns'>['phase'];
		artifactVisibility?: Doc<'customEmailRuns'>['artifactVisibility'];
		workingArtifactStatus?: Doc<'customEmailRuns'>['workingArtifactStatus'];
		visibleArtifactStatus?: Doc<'customEmailRuns'>['visibleArtifactStatus'];
		failAssistantMessage?: boolean;
		clearActiveMessageOperation?: boolean;
		clearActiveArtifactOperation?: boolean;
		writeRunError?: boolean;
	} = {}
) {
	const operation = await getOperationById(ctx, operationId);

	if (!operation) {
		return;
	}

	await ctx.db.patch(operation._id, {
		status: 'failed',
		errorText,
		updatedAt: now
	});

	if (failAssistantMessage && operation.assistantMessageId) {
		await ctx.db.patch(operation.assistantMessageId, {
			status: 'failed',
			errorText,
			updatedAt: now
		});
	}

	const run = await ctx.db.get(operation.runId);

	if (!run) {
		return;
	}

	await ctx.db.patch(operation.runId, {
		phase,
		...(artifactVisibility ? { artifactVisibility } : {}),
		...(workingArtifactStatus ? { workingArtifactStatus } : {}),
		...(visibleArtifactStatus ? { visibleArtifactStatus } : {}),
		...(clearActiveMessageOperation ? { activeMessageOperationId: undefined } : {}),
		...(clearActiveArtifactOperation ? { activeArtifactOperationId: undefined } : {}),
		...(writeRunError ? { errorText } : {}),
		updatedAt: now
	});
}
