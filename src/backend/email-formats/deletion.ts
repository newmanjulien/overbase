import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx } from '../../convex/_generated/server';

export async function deleteEmailFormatRecordTree(
	ctx: MutationCtx,
	emailFormat: Doc<'emailFormats'>
) {
	const [feedback, sentEmails] = await Promise.all([
		ctx.db
			.query('emailFeedback')
			.withIndex('by_workspace_emailFormat', (q) =>
				q
					.eq('workspaceId', emailFormat.workspaceId)
					.eq('emailFormatId', emailFormat._id)
			)
			.collect(),
		ctx.db
			.query('sentEmails')
			.withIndex('by_workspace_emailFormat_createdAt', (q) =>
				q
					.eq('workspaceId', emailFormat.workspaceId)
					.eq('emailFormatId', emailFormat._id)
			)
			.collect()
	]);

	for (const feedbackItem of feedback) {
		await ctx.db.delete(feedbackItem._id);
	}

	for (const sentEmail of sentEmails) {
		await ctx.db.delete(sentEmail._id);
	}

	await ctx.db.delete(emailFormat._id);
}

export async function deleteEmailFormatRecordsForWorkspace(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>
) {
	const [feedback, sentEmails, emailFormats] = await Promise.all([
		ctx.db
			.query('emailFeedback')
			.withIndex('by_workspace_emailFormat', (q) => q.eq('workspaceId', workspaceId))
			.collect(),
		ctx.db
			.query('sentEmails')
			.withIndex('by_workspace_emailFormat_createdAt', (q) => q.eq('workspaceId', workspaceId))
			.collect(),
		ctx.db
			.query('emailFormats')
			.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspaceId))
			.collect()
	]);

	for (const feedbackItem of feedback) {
		await ctx.db.delete(feedbackItem._id);
	}

	for (const sentEmail of sentEmails) {
		await ctx.db.delete(sentEmail._id);
	}

	for (const emailFormat of emailFormats) {
		await ctx.db.delete(emailFormat._id);
	}
}
