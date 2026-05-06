import { internalMutation } from './_generated/server';
import { EXPIRED_RUN_CLEANUP_LIMIT } from './customEmailCore';

export const deleteExpiredRuns = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();
		const runs = await ctx.db
			.query('customEmailRuns')
			.withIndex('by_expiresAt')
			.take(EXPIRED_RUN_CLEANUP_LIMIT);

		let deletedRuns = 0;
		let deletedMessages = 0;
		let deletedOperations = 0;
		let deletedEvents = 0;

		for (const run of runs) {
			if (run.expiresAt > now) {
				continue;
			}

			const [messages, operations, events] = await Promise.all([
				ctx.db
					.query('customEmailMessages')
					.withIndex('by_run_createdAt', (q) => q.eq('runId', run._id))
					.collect(),
				ctx.db
					.query('customEmailOperations')
					.withIndex('by_run_createdAt', (q) => q.eq('runId', run._id))
					.collect(),
				ctx.db
					.query('customEmailEvents')
					.withIndex('by_run_createdAt', (q) => q.eq('runId', run._id))
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

			await ctx.db.delete(run._id);
			deletedRuns += 1;
		}

		return {
			deletedRuns,
			deletedMessages,
			deletedOperations,
			deletedEvents
		};
	}
});
