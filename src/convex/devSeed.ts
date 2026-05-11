import { v } from 'convex/values';
import { normalizeEmailDraft, type EmailDraft } from '@overbase/builder-sdk/email';
import { mutation } from './_generated/server';

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
			filename: 'notification-sample-data.xlsx',
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
				text: `${title}: the notification found a few records that need review before the next partner update.`
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
				text: 'The attached workbook includes the rows that triggered this notification.'
			}
		]
	};
}

export const seedFeedbackEmailsForNotification = mutation({
	args: {
		notificationId: v.id('notifications'),
		replaceExisting: v.optional(v.boolean())
	},
	handler: async (ctx, { notificationId, replaceExisting = true }) => {
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			throw new Error('Notification not found.');
		}

		if (replaceExisting) {
			const feedback = await ctx.db
				.query('notificationEmailFeedback')
				.withIndex('by_notificationId', (q) => q.eq('notificationId', notificationId))
				.collect();
			const emails = await ctx.db
				.query('notificationEmails')
				.withIndex('by_notification_createdAt', (q) => q.eq('notificationId', notificationId))
				.collect();

			for (const feedbackItem of feedback) {
				await ctx.db.delete(feedbackItem._id);
			}

			for (const email of emails) {
				await ctx.db.delete(email._id);
			}
		}

		const now = Date.now();
		const drafts = [
			createPipelineAlertDraft(notification.title),
			createPartnerSignalDraft(notification.title),
			createDataQualityDraft(notification.title)
		];
		const emailIds = [];

		for (const [index, draft] of drafts.entries()) {
			const sentAt = now - index * 1000 * 60 * 60 * 18;
			const emailId = await ctx.db.insert('notificationEmails', {
				notificationId,
				sentAt,
				emailDraft: normalizeEmailDraft(draft),
				createdAt: sentAt
			});

			emailIds.push(emailId);
		}

		return {
			notificationId,
			insertedEmails: emailIds.length
		};
	}
});
