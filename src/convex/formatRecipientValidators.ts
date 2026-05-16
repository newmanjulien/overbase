import { v } from 'convex/values';

export const formatRecipientRef = v.union(
	v.object({
		kind: v.literal('user'),
		userId: v.id('users')
	}),
	v.object({
		kind: v.literal('teamMember'),
		teamMemberId: v.id('teamMembers')
	})
);
