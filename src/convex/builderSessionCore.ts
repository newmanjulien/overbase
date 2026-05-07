import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import {
	isBuilderSessionActive,
	verifyResumeToken
} from './builderSessionAccess';

export const ASSISTANT_STREAM_FLUSH_INTERVAL_MS = 150;
export const ASSISTANT_STREAM_FLUSH_MIN_CHARS = 120;
export const EXPIRED_SESSION_CLEANUP_LIMIT = 50;
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

export async function getAuthorizedSession(
	ctx: QueryCtx | MutationCtx,
	sessionId: Id<'builderSessions'>,
	resumeToken: string,
	now = Date.now()
) {
	const session = await ctx.db.get(sessionId);

	if (!session || !isBuilderSessionActive(session, now)) {
		return null;
	}

	if (!(await verifyResumeToken(session, resumeToken))) {
		return null;
	}

	return session;
}

export async function buildSessionSnapshot(
	ctx: QueryCtx | MutationCtx,
	session: Doc<'builderSessions'>,
	resumeToken: string
) {
	const messages = await ctx.db
		.query('builderSessionMessages')
		.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
		.collect();

	return {
		handle: {
			sessionId: session._id,
			resumeToken,
			appSlug: session.appSlug,
			expiresAt: session.expiresAt
		},
		session,
		messages
	};
}

export async function insertOperation(
	ctx: MutationCtx,
	{
		sessionId,
		kind,
		createdAt,
		assistantMessageId,
		operationId = createOperationId()
	}: {
		sessionId: Id<'builderSessions'>;
		kind: Doc<'builderSessionJobs'>['kind'];
		createdAt: number;
		assistantMessageId?: Id<'builderSessionMessages'>;
		operationId?: string;
	}
) {
	await ctx.db.insert('builderSessionJobs', {
		sessionId,
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
		.query('builderSessionJobs')
		.withIndex('by_operationId', (q) => q.eq('operationId', operationId))
		.unique();
}

export async function completeOperation(
	ctx: MutationCtx,
	operation: Doc<'builderSessionJobs'>,
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
		writeSessionError = true
	}: {
		phase?: Doc<'builderSessions'>['phase'];
		artifactVisibility?: Doc<'builderSessions'>['artifactVisibility'];
		workingArtifactStatus?: Doc<'builderSessions'>['workingArtifactStatus'];
		visibleArtifactStatus?: Doc<'builderSessions'>['visibleArtifactStatus'];
		failAssistantMessage?: boolean;
		clearActiveMessageOperation?: boolean;
		clearActiveArtifactOperation?: boolean;
		writeSessionError?: boolean;
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

	const session = await ctx.db.get(operation.sessionId);

	if (!session) {
		return;
	}

	await ctx.db.patch(operation.sessionId, {
		phase,
		...(artifactVisibility ? { artifactVisibility } : {}),
		...(workingArtifactStatus ? { workingArtifactStatus } : {}),
		...(visibleArtifactStatus ? { visibleArtifactStatus } : {}),
		...(clearActiveMessageOperation ? { activeMessageOperationId: undefined } : {}),
		...(clearActiveArtifactOperation ? { activeArtifactOperationId: undefined } : {}),
		...(writeSessionError ? { errorText } : {}),
		updatedAt: now
	});
}
