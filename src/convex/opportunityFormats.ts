import { v } from 'convex/values';
import { getVisiblePrimaryEmailDraftArtifact } from '@overbase/builder-sdk/artifacts';
import { normalizeEmailDraft } from '@overbase/builder-sdk/email';
import { mutation, query } from './_generated/server';
import { getAuthorizedSession } from '../backend/builder-sessions/records';
import { emailDraft as emailDraftValidator } from '../backend/validators/email-drafts';
import { formatRecipientRef } from '../backend/validators/recipients';
import {
	getDefaultFormatRecipientRefs,
	getFormatRecipients,
	normalizeFormatRecipientRefs
} from '../backend/opportunity-formats/recipients';
import { deleteOpportunityFormatRecordTree } from '../backend/opportunity-formats/deletion';
import {
	getOpportunityFormatCreator,
	normalizeOpportunityFormatTitle
} from '../backend/opportunity-formats/formats';
import {
	getOpportunityFormatReadiness,
	normalizeOpportunityFormatRules
} from '../backend/opportunity-formats/readiness';
import { getViewerWorkspaceRecord, requireViewerWorkspace } from '../backend/auth/viewer';

const opportunityFormatRule = v.object({
	id: v.string(),
	text: v.string()
});

export const publishFromBuilderSession = mutation({
	args: {
		sessionId: v.id('builderSessions'),
		title: v.string()
	},
	handler: async (ctx, { sessionId, title }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { user, workspace } = viewerWorkspace;
		const now = Date.now();
		const opportunityFormatTitle = normalizeOpportunityFormatTitle(title);
		const session = await getAuthorizedSession(ctx, sessionId, now, viewerWorkspace);

		if (!session) {
			throw new Error('Builder session not found.');
		}

		const artifact = getVisiblePrimaryEmailDraftArtifact(session.artifacts);

		if (!artifact) {
			throw new Error('Email draft not found.');
		}

		const emailDraft = normalizeEmailDraft(artifact.value);
		const opportunityFormatId = await ctx.db.insert('opportunityFormats', {
			workspaceId: workspace._id,
			title: opportunityFormatTitle,
			status: 'paused',
			definition: {
				kind: 'customEmail',
				builderAppSlug: session.appSlug
			},
			emailDraft,
			emailDraftVersion: 1,
			rules: [],
			recipientRefs: getDefaultFormatRecipientRefs(user._id),
			createdByUserId: user._id,
			createdAt: now,
			updatedAt: now
		});
		const opportunityFormat = await ctx.db.get(opportunityFormatId);

		if (!opportunityFormat) {
			throw new Error('Format not found after publish.');
		}

		return opportunityFormat;
	}
});

export const getOpportunityFormatDetail = query({
	args: {
		opportunityFormatId: v.id('opportunityFormats')
	},
	handler: async (ctx, { opportunityFormatId }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const opportunityFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(opportunityFormatId));

		if (!opportunityFormat) {
			return null;
		}

		const people = await getFormatRecipients(ctx, viewerWorkspace);
		const opportunityDocs = await ctx.db
			.query('opportunities')
			.withIndex('by_workspace_opportunityFormat_sentAt', (q) =>
				q
					.eq('workspaceId', opportunityFormat.workspaceId)
					.eq('opportunityFormatId', opportunityFormatId)
			)
			.order('desc')
			.collect();
		const opportunities = opportunityDocs.map((opportunity) => ({
			id: opportunity._id,
			sentAt: new Date(opportunity.sentAt).toISOString(),
			draft: opportunity.emailDraft
		}));
		const feedbackDocs = await ctx.db
			.query('opportunityFeedback')
			.withIndex('by_workspace_opportunityFormat', (q) =>
				q
					.eq('workspaceId', opportunityFormat.workspaceId)
					.eq('opportunityFormatId', opportunityFormatId)
			)
			.collect();
		const feedback = feedbackDocs.map((feedbackItem) => ({
			opportunityId: feedbackItem.opportunityId,
			likedText: feedbackItem.likedText,
			improvementText: feedbackItem.improvementText
		}));
		const feedbackUpdatedAt = feedbackDocs.reduce(
			(updatedAt, feedbackItem) => Math.max(updatedAt, feedbackItem.updatedAt),
			0
		);
		const rules = normalizeOpportunityFormatRules(opportunityFormat.rules);

		return {
			opportunityFormat: {
				id: opportunityFormat._id,
				title: opportunityFormat.title,
				status: opportunityFormat.status,
				definition: opportunityFormat.definition,
				emailDraft: opportunityFormat.emailDraft,
				emailDraftVersion: opportunityFormat.emailDraftVersion,
				rules,
				readiness: getOpportunityFormatReadiness(rules),
				recipientRefs: await normalizeFormatRecipientRefs(
					ctx,
					opportunityFormat.recipientRefs,
					viewerWorkspace
				),
				creator: await getOpportunityFormatCreator(
					ctx,
					opportunityFormat.createdByUserId,
					viewerWorkspace
				),
				createdAt: opportunityFormat.createdAt,
				updatedAt: opportunityFormat.updatedAt
			},
			people,
			opportunities,
			feedback,
			feedbackUpdatedAt
		};
	}
});

export const updateOpportunityFormatTitle = mutation({
	args: {
		opportunityFormatId: v.id('opportunityFormats'),
		title: v.string()
	},
	handler: async (ctx, { opportunityFormatId, title }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const opportunityFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(opportunityFormatId));

		if (!opportunityFormat) {
			throw new Error('Format not found.');
		}

		const opportunityFormatTitle = normalizeOpportunityFormatTitle(title);

		await ctx.db.patch(opportunityFormatId, {
			title: opportunityFormatTitle,
			updatedAt: Date.now()
		});

		return {
			title: opportunityFormatTitle
		};
	}
});

export const listOpportunityFormats = query({
	args: {},
	handler: async (ctx) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { workspace } = viewerWorkspace;
		const opportunityFormats = await ctx.db
			.query('opportunityFormats')
			.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspace._id))
			.order('desc')
			.collect();

		return await Promise.all(
			opportunityFormats.map(async (opportunityFormat) => ({
				id: opportunityFormat._id,
				title: opportunityFormat.title,
				status: opportunityFormat.status,
				readiness: getOpportunityFormatReadiness(opportunityFormat.rules),
				creator: await getOpportunityFormatCreator(
					ctx,
					opportunityFormat.createdByUserId,
					viewerWorkspace
				),
				createdAt: opportunityFormat.createdAt
			}))
		);
	}
});

export const deleteOpportunityFormats = mutation({
	args: {
		opportunityFormatIds: v.array(v.id('opportunityFormats'))
	},
	handler: async (ctx, { opportunityFormatIds }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);

		for (const opportunityFormatId of opportunityFormatIds) {
			const opportunityFormat = await getViewerWorkspaceRecord(
				viewerWorkspace,
				await ctx.db.get(opportunityFormatId)
			);
			if (!opportunityFormat) {
				continue;
			}

			await deleteOpportunityFormatRecordTree(ctx, opportunityFormat);
		}
	}
});

export const setOpportunityFormatStatus = mutation({
	args: {
		opportunityFormatId: v.id('opportunityFormats'),
		status: v.union(v.literal('paused'), v.literal('active'))
	},
	handler: async (ctx, { opportunityFormatId, status }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const opportunityFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(opportunityFormatId));

		if (!opportunityFormat) {
			throw new Error('Format not found.');
		}

		const readiness = getOpportunityFormatReadiness(opportunityFormat.rules);

		if (status === 'active' && !readiness.canActivate) {
			throw new Error(
				readiness.activationBlockers[0]?.message ?? 'Format is not ready to activate.'
			);
		}

		const updatedAt = Date.now();

		await ctx.db.patch(opportunityFormatId, {
			status,
			updatedAt
		});

		return {
			status,
			updatedAt
		};
	}
});

export const saveOpportunityFormatEmailDraft = mutation({
	args: {
		opportunityFormatId: v.id('opportunityFormats'),
		baseEmailDraftVersion: v.number(),
		draft: emailDraftValidator
	},
	handler: async (ctx, { opportunityFormatId, baseEmailDraftVersion, draft }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const opportunityFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(opportunityFormatId));

		if (!opportunityFormat) {
			throw new Error('Format not found.');
		}

		if (opportunityFormat.emailDraftVersion !== baseEmailDraftVersion) {
			throw new Error('This format was changed elsewhere. Reload and try again.');
		}

		const now = Date.now();
		const nextVersion = opportunityFormat.emailDraftVersion + 1;
		const emailDraft = normalizeEmailDraft(draft);

		await ctx.db.patch(opportunityFormatId, {
			emailDraft,
			emailDraftVersion: nextVersion,
			updatedAt: now
		});

		return {
			emailDraft,
			emailDraftVersion: nextVersion
		};
	}
});

export const saveOpportunityFormatRules = mutation({
	args: {
		opportunityFormatId: v.id('opportunityFormats'),
		rules: v.array(opportunityFormatRule)
	},
	handler: async (ctx, { opportunityFormatId, rules }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const opportunityFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(opportunityFormatId));

		if (!opportunityFormat) {
			throw new Error('Format not found.');
		}

		const now = Date.now();
		const normalizedRules = normalizeOpportunityFormatRules(rules);
		const readiness = getOpportunityFormatReadiness(normalizedRules);
		const status =
			opportunityFormat.status === 'active' && !readiness.canActivate
				? 'paused'
				: opportunityFormat.status;

		await ctx.db.patch(opportunityFormatId, {
			rules: normalizedRules,
			status,
			updatedAt: now
		});

		return {
			rules: normalizedRules,
			status,
			updatedAt: now
		};
	}
});

export const setOpportunityFormatRecipients = mutation({
	args: {
		opportunityFormatId: v.id('opportunityFormats'),
		recipientRefs: v.array(formatRecipientRef)
	},
	handler: async (ctx, { opportunityFormatId, recipientRefs }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const opportunityFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(opportunityFormatId));

		if (!opportunityFormat) {
			throw new Error('Format not found.');
		}

		const now = Date.now();
		const nextRecipientRefs = await normalizeFormatRecipientRefs(
			ctx,
			recipientRefs,
			viewerWorkspace
		);

		await ctx.db.patch(opportunityFormatId, {
			recipientRefs: nextRecipientRefs,
			updatedAt: now
		});

		return {
			recipientRefs: nextRecipientRefs,
			updatedAt: now
		};
	}
});

export const saveOpportunityFeedback = mutation({
	args: {
		opportunityId: v.id('opportunities'),
		likedText: v.string(),
		improvementText: v.string()
	},
	handler: async (ctx, { opportunityId, likedText, improvementText }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const opportunity = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(opportunityId));

		if (!opportunity) {
			throw new Error('Opportunity not found.');
		}

		const now = Date.now();
		const normalizedFeedback = {
			likedText: likedText.trim(),
			improvementText: improvementText.trim()
		};
		const existingFeedback = await ctx.db
			.query('opportunityFeedback')
			.withIndex('by_workspace_opportunity', (q) =>
				q.eq('workspaceId', opportunity.workspaceId).eq('opportunityId', opportunityId)
			)
			.first();

		if (existingFeedback) {
			await ctx.db.patch(existingFeedback._id, {
				...normalizedFeedback,
				updatedAt: now
			});

			return normalizedFeedback;
		}

		await ctx.db.insert('opportunityFeedback', {
			workspaceId: opportunity.workspaceId,
			opportunityFormatId: opportunity.opportunityFormatId,
			opportunityId,
			...normalizedFeedback,
			createdAt: now,
			updatedAt: now
		});

		return normalizedFeedback;
	}
});
