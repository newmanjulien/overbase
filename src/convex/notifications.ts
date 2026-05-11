import { v } from 'convex/values';
import { normalizeEmailDraft } from '@overbase/builder-sdk/email';
import { mutation, query } from './_generated/server';
import { getAuthorizedSession } from './builderSessionCore';
import {
	emailDraft as emailDraftValidator
} from './builderEmailValidators';
import {
	getPeopleRoster,
	normalizeTeamMemberIds
} from './teamRoster';
import {
	getNotificationReadiness,
	normalizeNotificationRules
} from './notificationReadiness';

const DEFAULT_NOTIFICATION_TITLE = 'Untitled notification';
const CREATED_BY_NAME = 'Overbase user';

const notificationRule = v.object({
	id: v.string(),
	text: v.string()
});

function normalizeNotificationTitle(title: string) {
	return title.trim() || DEFAULT_NOTIFICATION_TITLE;
}

export const publishFromBuilderSession = mutation({
	args: {
		sessionId: v.id('builderSessions'),
		resumeToken: v.string(),
		title: v.string()
	},
	handler: async (ctx, { sessionId, resumeToken, title }) => {
		const now = Date.now();
		const notificationTitle = normalizeNotificationTitle(title);
		const session = await getAuthorizedSession(ctx, sessionId, resumeToken, now);

		if (!session) {
			throw new Error('Builder session not found.');
		}

		if (!session.emailDraftState || session.emailDraftState.visibility !== 'visible') {
			throw new Error('Email draft not found.');
		}

		const emailDraft = normalizeEmailDraft(session.emailDraftState.draft);
		const teamMemberIds = normalizeTeamMemberIds([]);
		const notificationId = await ctx.db.insert('notifications', {
			title: notificationTitle,
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
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			throw new Error('Notification not found after publish.');
		}

		return notification;
	}
});

export const getNotificationDetail = query({
	args: {
		notificationId: v.id('notifications')
	},
	handler: async (ctx, { notificationId }) => {
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			return null;
		}

		const people = getPeopleRoster();
		const emailDocs = await ctx.db
			.query('notificationEmails')
			.withIndex('by_notification_sentAt', (q) => q.eq('notificationId', notificationId))
			.order('desc')
			.collect();
		const emails = emailDocs.map((email) => ({
			id: email._id,
			sentAt: new Date(email.sentAt).toISOString(),
			draft: email.emailDraft
		}));
		const feedbackDocs = await ctx.db
			.query('notificationEmailFeedback')
			.withIndex('by_notificationId', (q) => q.eq('notificationId', notificationId))
			.collect();
		const feedback = feedbackDocs.map((feedbackItem) => ({
			emailId: feedbackItem.emailId,
			likedText: feedbackItem.likedText,
			improvementText: feedbackItem.improvementText
		}));
		const feedbackUpdatedAt = feedbackDocs.reduce(
			(updatedAt, feedbackItem) => Math.max(updatedAt, feedbackItem.updatedAt),
			0
		);
		const rules = normalizeNotificationRules(notification.rules);

		return {
			notification: {
				id: notification._id,
				title: notification.title,
				status: notification.status,
				definition: notification.definition,
				emailDraft: notification.emailDraft,
				emailDraftVersion: notification.emailDraftVersion,
				rules,
				readiness: getNotificationReadiness(rules),
				teamMemberIds: normalizeTeamMemberIds(notification.teamMemberIds),
				createdByName: notification.createdByName,
				createdAt: notification.createdAt,
				updatedAt: notification.updatedAt
			},
			people,
			emails,
			feedback,
			feedbackUpdatedAt
		};
	}
});

export const updateNotificationTitle = mutation({
	args: {
		notificationId: v.id('notifications'),
		title: v.string()
	},
	handler: async (ctx, { notificationId, title }) => {
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			throw new Error('Notification not found.');
		}

		const notificationTitle = normalizeNotificationTitle(title);

		await ctx.db.patch(notificationId, {
			title: notificationTitle,
			updatedAt: Date.now()
		});

		return {
			title: notificationTitle
		};
	}
});

export const listNotifications = query({
	args: {},
	handler: async (ctx) => {
		const notifications = await ctx.db
			.query('notifications')
			.withIndex('by_createdAt')
			.order('desc')
			.collect();

		return notifications.map((notification) => ({
			id: notification._id,
			title: notification.title,
			status: notification.status,
			readiness: getNotificationReadiness(notification.rules),
			createdByName: notification.createdByName,
			createdAt: notification.createdAt
		}));
	}
});

export const deleteNotifications = mutation({
	args: {
		notificationIds: v.array(v.id('notifications'))
	},
	handler: async (ctx, { notificationIds }) => {
		for (const notificationId of notificationIds) {
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

			await ctx.db.delete(notificationId);
		}
	}
});

export const setNotificationStatus = mutation({
	args: {
		notificationId: v.id('notifications'),
		status: v.union(v.literal('paused'), v.literal('active'))
	},
	handler: async (ctx, { notificationId, status }) => {
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			throw new Error('Notification not found.');
		}

		const readiness = getNotificationReadiness(notification.rules);

		if (status === 'active' && !readiness.canActivate) {
			throw new Error(
				readiness.activationBlockers[0]?.message ?? 'Notification is not ready to activate.'
			);
		}

		const updatedAt = Date.now();

		await ctx.db.patch(notificationId, {
			status,
			updatedAt
		});

		return {
			status,
			updatedAt
		};
	}
});

export const saveNotificationEmailDraft = mutation({
	args: {
		notificationId: v.id('notifications'),
		baseEmailDraftVersion: v.number(),
		draft: emailDraftValidator
	},
	handler: async (ctx, { notificationId, baseEmailDraftVersion, draft }) => {
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			throw new Error('Notification not found.');
		}

		if (notification.emailDraftVersion !== baseEmailDraftVersion) {
			throw new Error('This notification was changed elsewhere. Reload and try again.');
		}

		const now = Date.now();
		const nextVersion = notification.emailDraftVersion + 1;
		const emailDraft = normalizeEmailDraft(draft);

		await ctx.db.patch(notificationId, {
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

export const saveNotificationRules = mutation({
	args: {
		notificationId: v.id('notifications'),
		rules: v.array(notificationRule)
	},
	handler: async (ctx, { notificationId, rules }) => {
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			throw new Error('Notification not found.');
		}

		const now = Date.now();
		const normalizedRules = normalizeNotificationRules(rules);
		const readiness = getNotificationReadiness(normalizedRules);
		const status =
			notification.status === 'active' && !readiness.canActivate ? 'paused' : notification.status;

		await ctx.db.patch(notificationId, {
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

export const setNotificationTeamMembers = mutation({
	args: {
		notificationId: v.id('notifications'),
		teamMemberIds: v.array(v.string())
	},
	handler: async (ctx, { notificationId, teamMemberIds }) => {
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			throw new Error('Notification not found.');
		}

		const now = Date.now();

		const nextTeamMemberIds = normalizeTeamMemberIds(teamMemberIds);

		await ctx.db.patch(notificationId, {
			teamMemberIds: nextTeamMemberIds,
			updatedAt: now
		});

		return {
			teamMemberIds: nextTeamMemberIds,
			updatedAt: now
		};
	}
});

export const saveNotificationEmailFeedback = mutation({
	args: {
		emailId: v.id('notificationEmails'),
		likedText: v.string(),
		improvementText: v.string()
	},
	handler: async (ctx, { emailId, likedText, improvementText }) => {
		const email = await ctx.db.get(emailId);

		if (!email) {
			throw new Error('Email not found.');
		}

		const now = Date.now();
		const normalizedFeedback = {
			likedText: likedText.trim(),
			improvementText: improvementText.trim()
		};
		const existingFeedback = await ctx.db
			.query('notificationEmailFeedback')
			.withIndex('by_emailId', (q) => q.eq('emailId', emailId))
			.first();

		if (existingFeedback) {
			await ctx.db.patch(existingFeedback._id, {
				...normalizedFeedback,
				updatedAt: now
			});

			return normalizedFeedback;
		}

		await ctx.db.insert('notificationEmailFeedback', {
			notificationId: email.notificationId,
			emailId,
			...normalizedFeedback,
			createdAt: now,
			updatedAt: now
		});

		return normalizedFeedback;
	}
});
