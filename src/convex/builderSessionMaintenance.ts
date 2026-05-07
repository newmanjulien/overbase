import { internalMutation } from './_generated/server';
import { EXPIRED_SESSION_CLEANUP_LIMIT } from './builderSessionCore';

export const deleteExpiredSessions = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		const sessions = await ctx.db
			.query('builderSessions')
			.withIndex('by_expiresAt')
			.take(EXPIRED_SESSION_CLEANUP_LIMIT);

		let deletedSessions = 0;
		let deletedMessages = 0;
		let deletedOperations = 0;
		let deletedEvents = 0;

		for (const session of sessions) {
			if (session.expiresAt > now) {
				continue;
			}

			const [messages, operations, events] = await Promise.all([
				ctx.db
					.query('builderSessionMessages')
					.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
					.collect(),
				ctx.db
					.query('builderSessionJobs')
					.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
					.collect(),
				ctx.db
					.query('builderSessionEvents')
					.withIndex('by_session_createdAt', (q) => q.eq('sessionId', session._id))
					.collect()
			]);

			for (const message of messages) {
				await ctx.db.delete(message._id);
				deletedMessages += 1;
			}

			for (const operation of operations) {
				await ctx.db.delete(operation._id);
				deletedOperations += 1;
			}

			for (const event of events) {
				await ctx.db.delete(event._id);
				deletedEvents += 1;
			}

			await ctx.db.delete(session._id);
			deletedSessions += 1;
		}

		return {
			deletedSessions,
			deletedMessages,
			deletedOperations,
			deletedEvents
		};
	}
});
