import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server';

type AuthenticatedUser = {
	user: Doc<'users'>;
	workspace: Doc<'workspaces'>;
	membership: Doc<'workspaceMemberships'>;
};

type CurrentUserAndWorkspace = {
	user: Doc<'users'>;
	workspace: Doc<'workspaces'> | null;
	membership: Doc<'workspaceMemberships'> | null;
};

function getIdentityEmail(identity: NonNullable<Awaited<ReturnType<QueryCtx['auth']['getUserIdentity']>>>) {
	return identity.email ?? identity.tokenIdentifier;
}

function getIdentityName(identity: NonNullable<Awaited<ReturnType<QueryCtx['auth']['getUserIdentity']>>>) {
	const name = identity.name?.trim();
	return name || undefined;
}

function getIdentityAvatar(identity: NonNullable<Awaited<ReturnType<QueryCtx['auth']['getUserIdentity']>>>) {
	return identity.pictureUrl?.trim() || undefined;
}

export async function requireAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity?.subject) {
		throw new Error('Authentication required.');
	}

	const user = await ctx.db
		.query('users')
		.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', identity.subject))
		.first();

	if (!user) {
		throw new Error('User has not been initialized.');
	}

	return user;
}

export async function getPrimaryWorkspaceForUser(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
	const user = await ctx.db.get(userId);

	if (!user?.primaryWorkspaceId) {
		return { workspace: null, membership: null };
	}

	const workspace = await ctx.db.get(user.primaryWorkspaceId);
	if (!workspace || workspace.createdByUserId !== userId) {
		return { workspace: null, membership: null };
	}

	const membership = await ctx.db
		.query('workspaceMemberships')
		.withIndex('by_workspace_user', (q) =>
			q.eq('workspaceId', workspace._id).eq('userId', userId)
		)
		.first();

	return { workspace, membership };
}

async function ensureOwnerMembership(
	ctx: MutationCtx,
	userId: Id<'users'>,
	workspaceId: Id<'workspaces'>,
	now: number
) {
	let membership = await ctx.db
		.query('workspaceMemberships')
		.withIndex('by_workspace_user', (q) =>
			q.eq('workspaceId', workspaceId).eq('userId', userId)
		)
		.first();

	if (!membership) {
		const membershipId = await ctx.db.insert('workspaceMemberships', {
			workspaceId,
			userId,
			role: 'owner',
			createdAt: now,
			updatedAt: now
		});
		membership = await ctx.db.get(membershipId);
	} else if (membership.role !== 'owner') {
		await ctx.db.patch(membership._id, {
			role: 'owner',
			updatedAt: now
		});
		membership = await ctx.db.get(membership._id);
	}

	if (!membership) {
		throw new Error('Unable to initialize workspace.');
	}

	return membership;
}

async function createPrimaryWorkspaceForUser(ctx: MutationCtx, user: Doc<'users'>, now: number) {
	const workspaceId = await ctx.db.insert('workspaces', {
		name: '',
		website: '',
		createdByUserId: user._id,
		createdAt: now,
		updatedAt: now
	});
	const membership = await ensureOwnerMembership(ctx, user._id, workspaceId, now);
	await ctx.db.patch(user._id, {
		primaryWorkspaceId: workspaceId,
		updatedAt: now
	});

	const [updatedUser, workspace] = await Promise.all([
		ctx.db.get(user._id),
		ctx.db.get(workspaceId)
	]);

	if (!updatedUser || !workspace) {
		throw new Error('Unable to initialize workspace.');
	}

	return { user: updatedUser, workspace, membership };
}

export async function requireWorkspace(ctx: QueryCtx | MutationCtx) {
	const user = await requireAuthenticatedUser(ctx);
	const { workspace, membership } = await getPrimaryWorkspaceForUser(ctx, user._id);

	if (!workspace || !membership) {
		throw new Error('Workspace required.');
	}

	return { user, workspace, membership };
}

export async function requireWorkspaceRecord<T extends { workspaceId: Id<'workspaces'> }>(
	ctx: QueryCtx | MutationCtx,
	record: T | null
) {
	const { workspace } = await requireWorkspace(ctx);

	if (!record || record.workspaceId !== workspace._id) {
		return null;
	}

	return record;
}

export const bootstrapCurrentUserAndWorkspace = mutation({
	args: {},
	handler: async (ctx): Promise<AuthenticatedUser> => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity?.subject) {
			throw new Error('Authentication required.');
		}

		const now = Date.now();
		const email = getIdentityEmail(identity);
		const displayName = getIdentityName(identity);
		const avatarUrl = getIdentityAvatar(identity);
		let user = await ctx.db
			.query('users')
			.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', identity.subject))
			.first();

		if (!user) {
			const userId = await ctx.db.insert('users', {
				clerkUserId: identity.subject,
				email,
				...(displayName ? { displayName } : {}),
				...(avatarUrl ? { avatarUrl } : {}),
				createdAt: now,
				updatedAt: now
			});
			user = await ctx.db.get(userId);
		} else {
			await ctx.db.patch(user._id, {
				email,
				...(displayName ? { displayName } : {}),
				...(avatarUrl ? { avatarUrl } : {}),
				updatedAt: now
			});
			user = await ctx.db.get(user._id);
		}

		if (!user) {
			throw new Error('Unable to initialize user.');
		}

		const primaryWorkspace = user.primaryWorkspaceId ? await ctx.db.get(user.primaryWorkspaceId) : null;

		if (!primaryWorkspace || primaryWorkspace.createdByUserId !== user._id) {
			return await createPrimaryWorkspaceForUser(ctx, user, now);
		}

		const membership = await ensureOwnerMembership(ctx, user._id, primaryWorkspace._id, now);

		return { user, workspace: primaryWorkspace, membership };
	}
});

export const saveOnboardingCompany = mutation({
	args: {
		companyName: v.string(),
		companyWebsite: v.string()
	},
	handler: async (ctx, { companyName, companyWebsite }): Promise<AuthenticatedUser> => {
		const { user, workspace, membership } = await requireWorkspace(ctx);
		const name = companyName.trim();
		const website = companyWebsite.trim();

		if (!name || !website) {
			throw new Error('Company name and website are required.');
		}

		await ctx.db.patch(workspace._id, {
			name,
			website,
			updatedAt: Date.now()
		});

		const updatedWorkspace = await ctx.db.get(workspace._id);
		if (!updatedWorkspace) {
			throw new Error('Unable to save company profile.');
		}

		return { user, workspace: updatedWorkspace, membership };
	}
});

export const currentUserAndWorkspace = query({
	args: {},
	handler: async (ctx): Promise<CurrentUserAndWorkspace | null> => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity?.subject) {
			return null;
		}

		const user = await ctx.db
			.query('users')
			.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', identity.subject))
			.first();

		if (!user) {
			return null;
		}

		const { workspace, membership } = await getPrimaryWorkspaceForUser(ctx, user._id);
		if (!workspace || !membership) {
			return { user, workspace: null, membership: null };
		}

		return { user, workspace, membership };
	}
});

export const markOnboardingComplete = mutation({
	args: {},
	handler: async (ctx) => {
		const { workspace } = await requireWorkspace(ctx);
		const now = Date.now();

		if (!workspace.onboardingCompletedAt) {
			await ctx.db.patch(workspace._id, {
				onboardingCompletedAt: now,
				updatedAt: now
			});
		}

		return { onboardingCompletedAt: workspace.onboardingCompletedAt ?? now };
	}
});
