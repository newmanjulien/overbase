import { v } from 'convex/values';
import { normalizeEmailDraft } from '@overbase/builder-sdk/email';
import { mutation, query } from './_generated/server';
import { getAuthorizedSession } from './builderSessionCore';
import {
	emailDraft as emailDraftValidator
} from './builderEmailValidators';
import {
	getFormatRecipients,
	normalizeFormatRecipientIds
} from './formatRecipients';
import {
	getOpportunityFormatReadiness,
	normalizeOpportunityFormatRules
} from './opportunityFormatReadiness';

const DEFAULT_OPPORTUNITY_FORMAT_TITLE = 'Untitled format';
const CREATED_BY_NAME = 'Overbase user';

const opportunityFormatRule = v.object({
	id: v.string(),
	text: v.string()
});

function normalizeOpportunityFormatTitle(title: string) {
	return title.trim() || DEFAULT_OPPORTUNITY_FORMAT_TITLE;
}

export const publishFromBuilderSession = mutation({
	args: {
		sessionId: v.id('builderSessions'),
		resumeToken: v.string(),
		title: v.string()
	},
	handler: async (ctx, { sessionId, resumeToken, title }) => {
		const now = Date.now();
		const opportunityFormatTitle = normalizeOpportunityFormatTitle(title);
		const session = await getAuthorizedSession(ctx, sessionId, resumeToken, now);

		if (!session) {
			throw new Error('Builder session not found.');
		}

		if (!session.emailDraftState || session.emailDraftState.visibility !== 'visible') {
			throw new Error('Email draft not found.');
		}

		const emailDraft = normalizeEmailDraft(session.emailDraftState.draft);
		const teamMemberIds = await normalizeFormatRecipientIds(ctx, []);
		const opportunityFormatId = await ctx.db.insert('opportunityFormats', {
			title: opportunityFormatTitle,
			status: 'paused',
			definition: {
				kind: 'customEmail',
				builderAppSlug: session.appSlug
			},
			emailDraft,
			emailDraftVersion: 1,
			rules: [],
			teamMemberIds,
			createdByName: CREATED_BY_NAME,
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
		const opportunityFormat = await ctx.db.get(opportunityFormatId);

		if (!opportunityFormat) {
			return null;
		}

		const people = await getFormatRecipients(ctx);
		const opportunityDocs = await ctx.db
			.query('opportunities')
			.withIndex('by_opportunityFormat_sentAt', (q) => q.eq('opportunityFormatId', opportunityFormatId))
			.order('desc')
			.collect();
		const opportunities = opportunityDocs.map((opportunity) => ({
			id: opportunity._id,
			sentAt: new Date(opportunity.sentAt).toISOString(),
			draft: opportunity.emailDraft
		}));
		const feedbackDocs = await ctx.db
			.query('opportunityFeedback')
			.withIndex('by_opportunityFormatId', (q) => q.eq('opportunityFormatId', opportunityFormatId))
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
				teamMemberIds: await normalizeFormatRecipientIds(ctx, opportunityFormat.teamMemberIds),
				createdByName: opportunityFormat.createdByName,
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
		const opportunityFormat = await ctx.db.get(opportunityFormatId);

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
		const opportunityFormats = await ctx.db
			.query('opportunityFormats')
			.withIndex('by_createdAt')
			.order('desc')
			.collect();

		return opportunityFormats.map((opportunityFormat) => ({
			id: opportunityFormat._id,
			title: opportunityFormat.title,
			status: opportunityFormat.status,
			readiness: getOpportunityFormatReadiness(opportunityFormat.rules),
			createdByName: opportunityFormat.createdByName,
			createdAt: opportunityFormat.createdAt
		}));
	}
});

export const deleteOpportunityFormats = mutation({
	args: {
		opportunityFormatIds: v.array(v.id('opportunityFormats'))
	},
	handler: async (ctx, { opportunityFormatIds }) => {
		for (const opportunityFormatId of opportunityFormatIds) {
			const feedback = await ctx.db
				.query('opportunityFeedback')
				.withIndex('by_opportunityFormatId', (q) => q.eq('opportunityFormatId', opportunityFormatId))
				.collect();
			const opportunities = await ctx.db
				.query('opportunities')
				.withIndex('by_opportunityFormat_createdAt', (q) => q.eq('opportunityFormatId', opportunityFormatId))
				.collect();

			for (const feedbackItem of feedback) {
				await ctx.db.delete(feedbackItem._id);
			}

			for (const opportunity of opportunities) {
				await ctx.db.delete(opportunity._id);
			}

			await ctx.db.delete(opportunityFormatId);
		}
	}
});

export const setOpportunityFormatStatus = mutation({
	args: {
		opportunityFormatId: v.id('opportunityFormats'),
		status: v.union(v.literal('paused'), v.literal('active'))
	},
	handler: async (ctx, { opportunityFormatId, status }) => {
		const opportunityFormat = await ctx.db.get(opportunityFormatId);

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
		const opportunityFormat = await ctx.db.get(opportunityFormatId);

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
		const opportunityFormat = await ctx.db.get(opportunityFormatId);

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

export const setOpportunityFormatTeamMembers = mutation({
	args: {
		opportunityFormatId: v.id('opportunityFormats'),
		teamMemberIds: v.array(v.string())
	},
	handler: async (ctx, { opportunityFormatId, teamMemberIds }) => {
		const opportunityFormat = await ctx.db.get(opportunityFormatId);

		if (!opportunityFormat) {
			throw new Error('Format not found.');
		}

		const now = Date.now();

		const nextTeamMemberIds = await normalizeFormatRecipientIds(ctx, teamMemberIds);

		await ctx.db.patch(opportunityFormatId, {
			teamMemberIds: nextTeamMemberIds,
			updatedAt: now
		});

		return {
			teamMemberIds: nextTeamMemberIds,
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
		const opportunity = await ctx.db.get(opportunityId);

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
			.withIndex('by_opportunityId', (q) => q.eq('opportunityId', opportunityId))
			.first();

		if (existingFeedback) {
			await ctx.db.patch(existingFeedback._id, {
				...normalizedFeedback,
				updatedAt: now
			});

			return normalizedFeedback;
		}

		await ctx.db.insert('opportunityFeedback', {
			opportunityFormatId: opportunity.opportunityFormatId,
			opportunityId,
			...normalizedFeedback,
			createdAt: now,
			updatedAt: now
		});

		return normalizedFeedback;
	}
});
