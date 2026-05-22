import {
	builderRunSetupsEqual,
	normalizeBuilderRunSetup,
	type BuilderRunSetup
} from '@overbase/builder-sdk/app-protocol';
import {
	getVisiblePrimaryEmailDraftArtifact,
	replaceBuilderArtifact
} from '@overbase/builder-sdk/artifacts';
import { hasEmailDraftChanged, normalizeEmailDraft } from '@overbase/builder-sdk/email';
import { getActiveBuilderAppPresentationEntry } from '../../builder-apps/registry';
import { internal } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';
import { requireViewerWorkspace } from '../auth/viewer';
import {
	getBuilderSessionExpiresAt,
	isBuilderSessionActive,
	normalizeStartRequestId,
	normalizeUserText
} from './expiry';
import { buildSessionSnapshot, getAuthorizedSession, insertJob } from './records';

async function getIdempotentStartSnapshot(
	ctx: MutationCtx,
	{
		appSlug,
		startRequestId,
		workspaceId,
		setup,
		expiresAt,
		now
	}: {
		appSlug: string;
		startRequestId?: string;
		workspaceId: Id<'workspaces'>;
		setup: BuilderRunSetup;
		expiresAt: number;
		now: number;
	}
) {
	if (!startRequestId) {
		return null;
	}

	const existingSession = await ctx.db
		.query('builderSessions')
		.withIndex('by_workspace_app_startRequestId', (q) =>
			q.eq('workspaceId', workspaceId).eq('appSlug', appSlug).eq('startRequestId', startRequestId)
		)
		.first();

	if (!existingSession) {
		return null;
	}

	if (!isBuilderSessionActive(existingSession, now)) {
		throw new Error('Builder session expired.');
	}

	const firstMessage = await ctx.db
		.query('builderSessionMessages')
		.withIndex('by_session_createdAt', (q) => q.eq('sessionId', existingSession._id))
		.first();

	if (firstMessage?.role !== 'user' || firstMessage.text !== setup.initialMessage) {
		throw new Error('Start request id was already used for a different message.');
	}

	if (!builderRunSetupsEqual(existingSession.setup, setup)) {
		throw new Error('Start request id was already used for a different setup.');
	}

	await ctx.db.patch(existingSession._id, {
		expiresAt,
		updatedAt: now
	});

	const resumedSession = await ctx.db.get(existingSession._id);

	if (!resumedSession) {
		throw new Error('Builder session not found.');
	}

	return await buildSessionSnapshot(ctx, resumedSession);
}

async function createTurn(
	ctx: MutationCtx,
	{
		session,
		userText,
		jobKind,
		now
	}: {
		session: Doc<'builderSessions'>;
		userText: string;
		jobKind: 'startTurn' | 'continueTurn';
		now: number;
	}
) {
	const userMessageId = await ctx.db.insert('builderSessionMessages', {
		sessionId: session._id,
		role: 'user',
		text: userText,
		status: 'complete',
		createdAt: now,
		updatedAt: now
	});
	const jobId = await insertJob(ctx, {
		sessionId: session._id,
		kind: jobKind,
		createdAt: now
	});
	const assistantMessageId = await ctx.db.insert('builderSessionMessages', {
		sessionId: session._id,
		role: 'assistant',
		text: '',
		status: 'pending',
		jobId,
		createdAt: now + 1,
		updatedAt: now + 1
	});

	await ctx.db.patch(jobId, {
		assistantMessageId,
		updatedAt: now
	});

	return {
		jobId,
		userMessageId,
		assistantMessageId
	};
}

export async function startBuilderSession(
	ctx: MutationCtx,
	{
		appSlug,
		setup,
		startRequestId
	}: {
		appSlug: string;
		setup: BuilderRunSetup;
		startRequestId?: string;
	}
) {
	const { workspace } = await requireViewerWorkspace(ctx);
	const now = Date.now();
	const normalizedSetup = normalizeBuilderRunSetup({
		...setup,
		initialMessage: normalizeUserText(setup.initialMessage)
	});
	const normalizedStartRequestId = normalizeStartRequestId(startRequestId);
	const expiresAt = getBuilderSessionExpiresAt(now);
	const app = getActiveBuilderAppPresentationEntry(appSlug);

	if (!app) {
		throw new Error('Builder app not found.');
	}

	const existingSessionSnapshot = await getIdempotentStartSnapshot(ctx, {
		appSlug: app.slug,
		startRequestId: normalizedStartRequestId,
		workspaceId: workspace._id,
		setup: normalizedSetup,
		expiresAt,
		now
	});

	if (existingSessionSnapshot) {
		return existingSessionSnapshot;
	}

	const sessionId = await ctx.db.insert('builderSessions', {
		workspaceId: workspace._id,
		appSlug: app.slug,
		appTitle: app.slug,
		...(normalizedStartRequestId ? { startRequestId: normalizedStartRequestId } : {}),
		setup: normalizedSetup,
		status: 'working',
		artifacts: {},
		createdAt: now,
		updatedAt: now,
		expiresAt
	});
	const session = await ctx.db.get(sessionId);

	if (!session) {
		throw new Error('Builder session not found after start.');
	}

	const turn = await createTurn(ctx, {
		session,
		userText: normalizedSetup.initialMessage,
		jobKind: 'startTurn',
		now
	});

	await ctx.db.patch(sessionId, {
		activeTurnJobId: turn.jobId,
		updatedAt: now
	});
	await ctx.scheduler.runAfter(0, internal.internal.builderSessions.runStartTurn, {
		jobId: turn.jobId
	});

	const updatedSession = await ctx.db.get(sessionId);

	if (!updatedSession) {
		throw new Error('Builder session not found after start.');
	}

	return {
		...(await buildSessionSnapshot(ctx, updatedSession)),
		userMessageId: turn.userMessageId,
		assistantMessageId: turn.assistantMessageId
	};
}

export async function resumeBuilderSession(ctx: MutationCtx, sessionId: Id<'builderSessions'>) {
	const now = Date.now();
	const session = await getAuthorizedSession(ctx, sessionId, now);

	if (!session) {
		return null;
	}

	const expiresAt = getBuilderSessionExpiresAt(now);

	await ctx.db.patch(session._id, {
		expiresAt,
		updatedAt: now
	});

	const resumedSession = await ctx.db.get(session._id);

	return resumedSession ? await buildSessionSnapshot(ctx, resumedSession) : null;
}

export async function getBuilderSessionSnapshot(
	ctx: QueryCtx,
	sessionId: Id<'builderSessions'>
) {
	const session = await getAuthorizedSession(ctx, sessionId);

	if (!session) {
		return null;
	}

	return await buildSessionSnapshot(ctx, session);
}

export async function sendBuilderSessionMessage(
	ctx: MutationCtx,
	{
		sessionId,
		text
	}: {
		sessionId: Id<'builderSessions'>;
		text: string;
	}
) {
	const now = Date.now();
	const normalizedText = normalizeUserText(text);
	const session = await getAuthorizedSession(ctx, sessionId, now);

	if (!session) {
		throw new Error('Builder session not found.');
	}

	if (session.activeTurnJobId) {
		throw new Error('Please wait for the assistant response to finish before sending another message.');
	}

	if (session.status !== 'waitingForUser' && session.status !== 'ready') {
		throw new Error('This builder is not ready for another message yet.');
	}

	const expiresAt = getBuilderSessionExpiresAt(now);
	const turn = await createTurn(ctx, {
		session,
		userText: normalizedText,
		jobKind: 'continueTurn',
		now
	});

	await ctx.db.patch(session._id, {
		status: 'working',
		activeTurnJobId: turn.jobId,
		expiresAt,
		updatedAt: now
	});
	await ctx.scheduler.runAfter(0, internal.internal.builderSessions.runContinueTurn, {
		jobId: turn.jobId
	});

	const updatedSession = await ctx.db.get(session._id);

	if (!updatedSession) {
		throw new Error('Builder session not found after send.');
	}

	return {
		...(await buildSessionSnapshot(ctx, updatedSession)),
		userMessageId: turn.userMessageId,
		assistantMessageId: turn.assistantMessageId
	};
}

export async function saveBuilderSessionEmailDraft(
	ctx: MutationCtx,
	{
		sessionId,
		baseEmailDraftVersion,
		emailDraft
	}: {
		sessionId: Id<'builderSessions'>;
		baseEmailDraftVersion: number;
		emailDraft: Parameters<typeof normalizeEmailDraft>[0];
	}
) {
	const now = Date.now();
	const session = await getAuthorizedSession(ctx, sessionId, now);
	const artifact = session ? getVisiblePrimaryEmailDraftArtifact(session.artifacts) : null;

	if (!session || !artifact) {
		throw new Error('Email draft not found.');
	}

	if (session.activeTurnJobId) {
		throw new Error('Please wait for the assistant response to finish before editing the draft.');
	}

	if (baseEmailDraftVersion !== artifact.version) {
		throw new Error('The draft changed while you were editing. Review the latest version before saving.');
	}

	const normalizedDraft = normalizeEmailDraft(emailDraft);
	const previousDraft = normalizeEmailDraft(artifact.value);
	const expiresAt = getBuilderSessionExpiresAt(now);

	if (!hasEmailDraftChanged(previousDraft, normalizedDraft)) {
		await ctx.db.patch(session._id, {
			expiresAt,
			updatedAt: now
		});

		const updatedSession = await ctx.db.get(session._id);

		return {
			snapshot: updatedSession ? await buildSessionSnapshot(ctx, updatedSession) : null,
			expiresAt,
			emailDraftVersion: artifact.version,
			changed: false
		};
	}

	const nextArtifact = {
		...artifact,
		version: artifact.version + 1,
		visibility: 'visible' as const,
		value: normalizedDraft
	};

	await ctx.db.patch(session._id, {
		artifacts: replaceBuilderArtifact(session.artifacts, nextArtifact),
		expiresAt,
		updatedAt: now
	});

	const updatedSession = await ctx.db.get(session._id);

	return {
		snapshot: updatedSession ? await buildSessionSnapshot(ctx, updatedSession) : null,
		expiresAt,
		emailDraftVersion: nextArtifact.version,
		changed: true
	};
}
