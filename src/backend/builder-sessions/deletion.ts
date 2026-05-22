import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx } from '../../convex/_generated/server';

export const EXPIRED_SESSION_CLEANUP_LIMIT = 50;

export type DeletedBuilderSessionRecordCounts = {
	deletedSessions: number;
	deletedMessages: number;
	deletedJobs: number;
};

function emptyDeletedBuilderSessionRecordCounts(): DeletedBuilderSessionRecordCounts {
	return {
		deletedSessions: 0,
		deletedMessages: 0,
		deletedJobs: 0
	};
}

function addDeletedBuilderSessionRecordCounts(
	total: DeletedBuilderSessionRecordCounts,
	next: DeletedBuilderSessionRecordCounts
) {
	total.deletedSessions += next.deletedSessions;
	total.deletedMessages += next.deletedMessages;
	total.deletedJobs += next.deletedJobs;
}

export async function deleteBuilderSessionRecordTree(
	ctx: MutationCtx,
	session: Doc<'builderSessions'>
): Promise<DeletedBuilderSessionRecordCounts> {
	const [messages, jobs] = await Promise.all([
		ctx.db
			.query('builderSessionMessages')
			.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
			.collect(),
		ctx.db
			.query('builderSessionJobs')
			.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
			.collect()
	]);

	for (const message of messages) {
		await ctx.db.delete(message._id);
	}

	for (const job of jobs) {
		await ctx.db.delete(job._id);
	}

	await ctx.db.delete(session._id);

	return {
		deletedSessions: 1,
		deletedMessages: messages.length,
		deletedJobs: jobs.length
	};
}

export async function deleteBuilderSessionsForWorkspace(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>
) {
	const sessions = await ctx.db
		.query('builderSessions')
		.withIndex('by_workspace_app_startRequestId', (q) => q.eq('workspaceId', workspaceId))
		.collect();
	const counts = emptyDeletedBuilderSessionRecordCounts();

	for (const session of sessions) {
		addDeletedBuilderSessionRecordCounts(
			counts,
			await deleteBuilderSessionRecordTree(ctx, session)
		);
	}

	return counts;
}

export async function deleteExpiredBuilderSessions(
	ctx: MutationCtx,
	{
		limit = EXPIRED_SESSION_CLEANUP_LIMIT,
		now = Date.now()
	}: {
		limit?: number;
		now?: number;
	} = {}
) {
	const sessions = await ctx.db
		.query('builderSessions')
		.withIndex('by_expiresAt')
		.take(limit);
	const counts = emptyDeletedBuilderSessionRecordCounts();

	for (const session of sessions) {
		if (session.expiresAt > now) {
			continue;
		}

		addDeletedBuilderSessionRecordCounts(
			counts,
			await deleteBuilderSessionRecordTree(ctx, session)
		);
	}

	return counts;
}
