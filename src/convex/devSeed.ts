import { v } from 'convex/values';
import { normalizeEmailDraft, type EmailDraft } from '../shared/email-drafts';
import { mutation } from './_generated/server';
import { getViewerWorkspaceRecord, requireViewerWorkspace } from '../backend/auth/viewer';

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
				text: `${title}: this email format found a few records that need review before the next partner update.`
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

export const seedSentEmailsForFormat = mutation({
	args: {
		emailFormatId: v.id('emailFormats'),
		replaceExisting: v.optional(v.boolean())
	},
	handler: async (ctx, { emailFormatId, replaceExisting = true }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const emailFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(emailFormatId));

		if (!emailFormat) {
			throw new Error('Email format not found.');
		}

		if (replaceExisting) {
			const feedback = await ctx.db
				.query('emailFeedback')
				.withIndex('by_workspace_emailFormat', (q) =>
					q
						.eq('workspaceId', emailFormat.workspaceId)
						.eq('emailFormatId', emailFormatId)
				)
				.collect();
			const sentEmails = await ctx.db
				.query('sentEmails')
				.withIndex('by_workspace_emailFormat_createdAt', (q) =>
					q
						.eq('workspaceId', emailFormat.workspaceId)
						.eq('emailFormatId', emailFormatId)
				)
				.collect();

			for (const feedbackItem of feedback) {
				await ctx.db.delete(feedbackItem._id);
			}

			for (const sentEmail of sentEmails) {
				await ctx.db.delete(sentEmail._id);
			}
		}

		const now = Date.now();
		const drafts = [
			createPipelineAlertDraft(emailFormat.title),
			createPartnerSignalDraft(emailFormat.title),
			createDataQualityDraft(emailFormat.title)
		];
		const sentEmailIds = [];

		for (const [index, draft] of drafts.entries()) {
			const sentAt = now - index * 1000 * 60 * 60 * 18;
			const sentEmailId = await ctx.db.insert('sentEmails', {
				workspaceId: emailFormat.workspaceId,
				emailFormatId,
				sentAt,
				emailDraft: normalizeEmailDraft(draft),
				createdAt: sentAt
			});

			sentEmailIds.push(sentEmailId);
		}

		return {
			emailFormatId,
			insertedSentEmails: sentEmailIds.length
		};
	}
});
