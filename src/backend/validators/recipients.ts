import { v } from 'convex/values';

export const emailFormatRecipientRef = v.union(
	v.object({
		kind: v.literal('user'),
		userId: v.id('users')
	}),
	v.object({
		kind: v.literal('teammate'),
		teammateId: v.id('teammates')
	})
);
