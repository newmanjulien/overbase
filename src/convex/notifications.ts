import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthorizedSession } from './builderSessionCore';

const DEFAULT_NOTIFICATION_TITLE = 'Untitled notification';
const CREATED_BY_NAME = 'Overbase user';

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

		const existingNotification = await ctx.db
			.query('notifications')
			.withIndex('by_publishedFromBuilderSessionId', (q) =>
				q.eq('publishedFromBuilderSessionId', session._id)
			)
			.first();

		if (existingNotification) {
			if (
				existingNotification.title !== notificationTitle ||
				existingNotification.definition.builderAppSlug !== session.appSlug
			) {
				await ctx.db.patch(existingNotification._id, {
					title: notificationTitle,
					definition: {
						kind: 'customEmail',
						builderAppSlug: session.appSlug
					},
					updatedAt: now
				});

				const updatedNotification = await ctx.db.get(existingNotification._id);

				if (!updatedNotification) {
					throw new Error('Notification not found after publish.');
				}

				return updatedNotification;
			}

			return existingNotification;
		}

		const notificationId = await ctx.db.insert('notifications', {
			title: notificationTitle,
			status: 'paused',
			definition: {
				kind: 'customEmail',
				builderAppSlug: session.appSlug
			},
			createdByName: CREATED_BY_NAME,
			createdAt: now,
			updatedAt: now,
			publishedFromBuilderSessionId: session._id
		});
		const notification = await ctx.db.get(notificationId);

		if (!notification) {
			throw new Error('Notification not found after publish.');
		}

		return notification;
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
			await ctx.db.delete(notificationId);
		}
	}
});
