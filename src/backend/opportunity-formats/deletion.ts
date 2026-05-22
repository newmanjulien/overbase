import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx } from '../../convex/_generated/server';

export async function deleteOpportunityFormatRecordTree(
	ctx: MutationCtx,
	opportunityFormat: Doc<'opportunityFormats'>
) {
	const [feedback, opportunities] = await Promise.all([
		ctx.db
			.query('opportunityFeedback')
			.withIndex('by_workspace_opportunityFormat', (q) =>
				q
					.eq('workspaceId', opportunityFormat.workspaceId)
					.eq('opportunityFormatId', opportunityFormat._id)
			)
			.collect(),
		ctx.db
			.query('opportunities')
			.withIndex('by_workspace_opportunityFormat_createdAt', (q) =>
				q
					.eq('workspaceId', opportunityFormat.workspaceId)
					.eq('opportunityFormatId', opportunityFormat._id)
			)
			.collect()
	]);

	for (const feedbackItem of feedback) {
		await ctx.db.delete(feedbackItem._id);
	}

	for (const opportunity of opportunities) {
		await ctx.db.delete(opportunity._id);
	}

	await ctx.db.delete(opportunityFormat._id);
}

export async function deleteOpportunityRecordsForWorkspace(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>
) {
	const [feedback, opportunities, opportunityFormats] = await Promise.all([
		ctx.db
			.query('opportunityFeedback')
			.withIndex('by_workspace_opportunityFormat', (q) => q.eq('workspaceId', workspaceId))
			.collect(),
		ctx.db
			.query('opportunities')
			.withIndex('by_workspace_opportunityFormat_createdAt', (q) => q.eq('workspaceId', workspaceId))
			.collect(),
		ctx.db
			.query('opportunityFormats')
			.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspaceId))
			.collect()
	]);

	for (const feedbackItem of feedback) {
		await ctx.db.delete(feedbackItem._id);
	}

	for (const opportunity of opportunities) {
		await ctx.db.delete(opportunity._id);
	}

	for (const opportunityFormat of opportunityFormats) {
		await ctx.db.delete(opportunityFormat._id);
	}
}
