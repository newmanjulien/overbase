import { v } from 'convex/values';
import { normalizeEmailDraft, type EmailDraft } from '@overbase/builder-sdk/email';
import { mutation } from './_generated/server';
import { getViewerWorkspaceRecord, requireViewerWorkspace } from './auth';

function createPipelineAlertDraft(title: string): EmailDraft {
	return {
		to: ['growth@overbase.local'],
		cc: ['ops@overbase.local'],
		attachment: null,
		body: [
			{
				type: 'paragraph',
				text: `${title}: three partner accounts are showing new activity that may need follow-up this week.`
			},
			{
				type: 'bullets',
				items: [
					'Acme Capital opened the shared portfolio workbook twice in the last 24 hours.',
					'Northstar Partners added two new companies to their diligence tracker.',
					'Juniper Group has not responded to the last two requested updates.'
				]
			},
			{
				type: 'paragraph',
				text: 'Recommended next step: send a short check-in to Acme and Northstar, then assign an owner for the Juniper follow-up.'
			}
		]
	};
}

function createPartnerSignalDraft(title: string): EmailDraft {
	return {
		to: ['partnerships@overbase.local'],
		cc: [],
		attachment: null,
		body: [
			{
				type: 'paragraph',
				text: `${title}: partner engagement increased since the last digest. The strongest signal is concentrated around the Q3 pipeline list.`
			},
			{
				type: 'bullets',
				items: [
					'Saw repeat views from two partner domains within a six-hour window.',
					'One partner downloaded the latest operating metrics export.',
					'No activity yet from the partner tagged as high priority.'
				]
			},
			{
				type: 'link',
				label: 'Open partner activity',
				href: 'https://app.overbase.local/partners/activity'
			}
		]
	};
}

function createDataQualityDraft(title: string): EmailDraft {
	return {
		to: ['data@overbase.local'],
		cc: ['growth@overbase.local'],
		attachment: {
			filename: 'opportunity-sample-data.xlsx',
			cells: [
				['Partner', 'Signal', 'Priority'],
				['Acme Capital', 'Viewed pipeline workbook', 'High'],
				['Northstar Partners', 'Added diligence notes', 'Medium'],
				['Juniper Group', 'Missing update', 'High']
			]
		},
		body: [
			{
				type: 'paragraph',
				text: `${title}: this opportunity format found a few records that need review before the next partner update.`
			},
			{
				type: 'bullets',
				items: [
					'Three partner records are missing a current owner.',
					'Two companies have conflicting stage values across connected data sources.',
					'One high-priority partner has an update older than 14 days.'
				]
			},
			{
				type: 'paragraph',
				text: 'The attached workbook includes the rows that triggered this opportunity.'
			}
		]
	};
}

export const seedOpportunitiesForFormat = mutation({
	args: {
		opportunityFormatId: v.id('opportunityFormats'),
		replaceExisting: v.optional(v.boolean())
	},
	handler: async (ctx, { opportunityFormatId, replaceExisting = true }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const opportunityFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(opportunityFormatId));

		if (!opportunityFormat) {
			throw new Error('Format not found.');
		}

		if (replaceExisting) {
			const feedback = await ctx.db
				.query('opportunityFeedback')
				.withIndex('by_workspace_opportunityFormat', (q) =>
					q
						.eq('workspaceId', opportunityFormat.workspaceId)
						.eq('opportunityFormatId', opportunityFormatId)
				)
				.collect();
			const opportunities = await ctx.db
				.query('opportunities')
				.withIndex('by_workspace_opportunityFormat_createdAt', (q) =>
					q
						.eq('workspaceId', opportunityFormat.workspaceId)
						.eq('opportunityFormatId', opportunityFormatId)
				)
				.collect();

			for (const feedbackItem of feedback) {
				await ctx.db.delete(feedbackItem._id);
			}

			for (const opportunity of opportunities) {
				await ctx.db.delete(opportunity._id);
			}
		}

		const now = Date.now();
		const drafts = [
			createPipelineAlertDraft(opportunityFormat.title),
			createPartnerSignalDraft(opportunityFormat.title),
			createDataQualityDraft(opportunityFormat.title)
		];
		const opportunityIds = [];

		for (const [index, draft] of drafts.entries()) {
			const sentAt = now - index * 1000 * 60 * 60 * 18;
			const opportunityId = await ctx.db.insert('opportunities', {
				workspaceId: opportunityFormat.workspaceId,
				opportunityFormatId,
				sentAt,
				emailDraft: normalizeEmailDraft(draft),
				createdAt: sentAt
			});

			opportunityIds.push(opportunityId);
		}

		return {
			opportunityFormatId,
			insertedOpportunities: opportunityIds.length
		};
	}
});
