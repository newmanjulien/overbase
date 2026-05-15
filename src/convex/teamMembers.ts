import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

const EMAIL_SEPARATOR_REGEX = /[,\s]+/;
const EMAIL_REGEX = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

function normalizeEmail(email: string) {
	return email.trim().toLocaleLowerCase();
}

function parseEmails(input: string[]) {
	const normalizedEmails = input
		.flatMap((value) => value.split(EMAIL_SEPARATOR_REGEX))
		.map(normalizeEmail)
		.filter(Boolean);
	const uniqueEmails = [...new Set(normalizedEmails)];
	const invalidEmails = uniqueEmails.filter((email) => !EMAIL_REGEX.test(email));

	if (invalidEmails.length > 0) {
		throw new Error(`Invalid email: ${invalidEmails[0]}`);
	}

	return uniqueEmails;
}

export const listTeamMembers = query({
	args: {},
	handler: async (ctx) => {
		const teamMembers = await ctx.db.query('teamMembers').withIndex('by_createdAt').order('desc').collect();

		return teamMembers.map((teamMember) => ({
			id: teamMember._id,
			email: teamMember.email,
			createdAt: teamMember.createdAt,
			updatedAt: teamMember.updatedAt
		}));
	}
});

export const addTeamMembers = mutation({
	args: {
		emails: v.array(v.string())
	},
	handler: async (ctx, { emails }) => {
		const normalizedEmails = parseEmails(emails);

		if (normalizedEmails.length === 0) {
			throw new Error('Add at least one email.');
		}

		const now = Date.now();
		const insertedIds = [];
		const skippedEmails = [];

		for (const email of normalizedEmails) {
			const existingTeamMember = await ctx.db
				.query('teamMembers')
				.withIndex('by_email', (q) => q.eq('email', email))
				.first();

			if (existingTeamMember) {
				skippedEmails.push(email);
				continue;
			}

			insertedIds.push(
				await ctx.db.insert('teamMembers', {
					email,
					createdAt: now,
					updatedAt: now
				})
			);
		}

		return {
			insertedIds,
			skippedEmails
		};
	}
});

export const deleteTeamMembers = mutation({
	args: {
		teamMemberIds: v.array(v.id('teamMembers'))
	},
	handler: async (ctx, { teamMemberIds }) => {
		for (const teamMemberId of new Set(teamMemberIds)) {
			const teamMember = await ctx.db.get(teamMemberId);

			if (teamMember) {
				await ctx.db.delete(teamMemberId);
			}
		}
	}
});
