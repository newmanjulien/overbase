import {
	CURRENT_USER_ID,
	CURRENT_USER_PROFILE
} from '../lib/app/current-user';
import type { QueryCtx } from './_generated/server';

const CURRENT_USER_RECIPIENT = {
	id: CURRENT_USER_ID,
	...CURRENT_USER_PROFILE
} as const;

export async function getFormatRecipients(ctx: Pick<QueryCtx, 'db'>) {
	const dbTeamMembers = await ctx.db.query('teamMembers').withIndex('by_createdAt').order('desc').collect();

	return [
		CURRENT_USER_RECIPIENT,
		...dbTeamMembers.map((teamMember) => ({
			id: teamMember._id,
			name: teamMember.email,
			avatar: ''
		}))
	];
}

export async function normalizeFormatRecipientIds(ctx: Pick<QueryCtx, 'db'>, recipientIds: string[]) {
	const recipients = await getFormatRecipients(ctx);
	const requestedRecipientIds = new Set(recipientIds.map((id) => id.trim()).filter(Boolean));
	const validRecipientIds = recipients
		.filter((recipient) => requestedRecipientIds.has(recipient.id))
		.map((recipient) => recipient.id);

	return validRecipientIds.length > 0 ? validRecipientIds : [CURRENT_USER_ID];
}
