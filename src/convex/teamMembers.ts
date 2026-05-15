import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import {
	getTeamMemberDisplayName,
	normalizeTeamMemberEmail,
	normalizeTeamMemberName,
	TEAM_MEMBER_EMAIL_REGEX,
	TEAM_MEMBER_EMAIL_SEPARATOR_REGEX
} from './teamMemberIdentity';

function toTeamMemberResult(teamMember: {
	_id: Id<'teamMembers'>;
	email: string;
	name: string;
	createdAt: number;
	updatedAt: number;
}) {
	return {
		id: teamMember._id,
		email: teamMember.email,
		name: teamMember.name,
		displayName: getTeamMemberDisplayName(teamMember),
		createdAt: teamMember.createdAt,
		updatedAt: teamMember.updatedAt
	};
}

function parseEmails(input: string[]) {
	const normalizedEmails = input
		.flatMap((value) => value.split(TEAM_MEMBER_EMAIL_SEPARATOR_REGEX))
		.map(normalizeTeamMemberEmail)
		.filter(Boolean);
	const uniqueEmails = [...new Set(normalizedEmails)];
	const invalidEmails = uniqueEmails.filter((email) => !TEAM_MEMBER_EMAIL_REGEX.test(email));

	if (invalidEmails.length > 0) {
		throw new Error(`Invalid email: ${invalidEmails[0]}`);
	}

	return uniqueEmails;
}

export const listTeamMembers = query({
	args: {},
	handler: async (ctx) => {
		const teamMembers = await ctx.db.query('teamMembers').withIndex('by_createdAt').order('desc').collect();

		return teamMembers.map(toTeamMemberResult);
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
					name: '',
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

export const updateTeamMember = mutation({
	args: {
		teamMemberId: v.id('teamMembers'),
		email: v.string(),
		name: v.string()
	},
	handler: async (ctx, { teamMemberId, email, name }) => {
		const teamMember = await ctx.db.get(teamMemberId);

		if (!teamMember) {
			throw new Error('Teammate not found.');
		}

		const normalizedEmail = normalizeTeamMemberEmail(email);

		if (!TEAM_MEMBER_EMAIL_REGEX.test(normalizedEmail)) {
			throw new Error(`Invalid email: ${normalizedEmail || email}`);
		}

		const existingTeamMember = await ctx.db
			.query('teamMembers')
			.withIndex('by_email', (q) => q.eq('email', normalizedEmail))
			.first();

		if (existingTeamMember && existingTeamMember._id !== teamMemberId) {
			throw new Error(`Email already exists: ${normalizedEmail}`);
		}

		const updatedTeamMember = {
			...teamMember,
			email: normalizedEmail,
			name: normalizeTeamMemberName(name),
			updatedAt: Date.now()
		};

		await ctx.db.patch(teamMemberId, {
			email: updatedTeamMember.email,
			name: updatedTeamMember.name,
			updatedAt: updatedTeamMember.updatedAt
		});

		return toTeamMemberResult(updatedTeamMember);
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
