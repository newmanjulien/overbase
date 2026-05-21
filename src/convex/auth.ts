import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server';

export type ViewerWorkspace = {
	user: Doc<'users'>;
	workspace: Doc<'workspaces'>;
	identityEmail: string;
	identityName?: string;
};

type CurrentUserAndWorkspace = {
	user: Doc<'users'>;
	workspace: Doc<'workspaces'> | null;
	identityEmail: string;
	identityName?: string;
};

type ClerkIdentity = NonNullable<Awaited<ReturnType<QueryCtx['auth']['getUserIdentity']>>>;

function getIdentityEmail(identity: ClerkIdentity) {
	return identity.email ?? identity.tokenIdentifier;
}

function getIdentityName(identity: ClerkIdentity) {
	const name = identity.name?.trim();
	return name || undefined;
}

function getIdentityMetadata(identity: ClerkIdentity) {
	const identityName = getIdentityName(identity);

	return {
		identityEmail: getIdentityEmail(identity),
		...(identityName ? { identityName } : {})
	};
}

async function getViewerIdentity(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity?.subject) {
		throw new Error('Authentication required.');
	}

	return identity;
}

async function getUserForIdentity(ctx: QueryCtx | MutationCtx, identity: ClerkIdentity) {
	const user = await ctx.db
		.query('users')
		.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', identity.subject))
		.first();

	return user;
}

export async function requireAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
	const identity = await getViewerIdentity(ctx);
	const user = await getUserForIdentity(ctx, identity);

	if (!user) {
		throw new Error('User has not been initialized.');
	}

	return user;
}

export async function getWorkspaceForUser(ctx: QueryCtx | MutationCtx, user: Doc<'users'>) {
	if (!user.workspaceId) {
		return null;
	}

	const workspace = await ctx.db.get(user.workspaceId);

	if (!workspace || workspace.ownerUserId !== user._id) {
		return null;
	}

	return workspace;
}

async function createWorkspaceForUser(ctx: MutationCtx, user: Doc<'users'>, now: number) {
	const workspaceId = await ctx.db.insert('workspaces', {
		name: '',
		website: '',
		ownerUserId: user._id,
		createdAt: now,
		updatedAt: now
	});

	await ctx.db.patch(user._id, {
		workspaceId,
		updatedAt: now
	});

	const [updatedUser, workspace] = await Promise.all([
		ctx.db.get(user._id),
		ctx.db.get(workspaceId)
	]);

	if (!updatedUser || !workspace) {
		throw new Error('Unable to initialize workspace.');
	}

	return { user: updatedUser, workspace };
}

export async function requireViewerWorkspace(ctx: QueryCtx | MutationCtx): Promise<ViewerWorkspace> {
	const identity = await getViewerIdentity(ctx);
	const user = await getUserForIdentity(ctx, identity);

	if (!user) {
		throw new Error('User has not been initialized.');
	}

	const workspace = await getWorkspaceForUser(ctx, user);

	if (!workspace) {
		throw new Error('Workspace required.');
	}

	return { user, workspace, ...getIdentityMetadata(identity) };
}

export async function requireWorkspaceRecord<T extends { workspaceId: Id<'workspaces'> }>(
	ctx: QueryCtx | MutationCtx,
	record: T | null
) {
	const { workspace } = await requireViewerWorkspace(ctx);

	if (!record || record.workspaceId !== workspace._id) {
		return null;
	}

	return record;
}

export function getViewerWorkspaceRecord<T extends { workspaceId: Id<'workspaces'> }>(
	{ workspace }: ViewerWorkspace,
	record: T | null
) {
	if (!record || record.workspaceId !== workspace._id) {
		return null;
	}

	return record;
}

export const ensureViewerWorkspace = mutation({
	args: {},
	handler: async (ctx): Promise<ViewerWorkspace> => {
		const identity = await getViewerIdentity(ctx);
		const now = Date.now();
		const displayName = getIdentityName(identity);
		let user = await ctx.db
			.query('users')
			.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', identity.subject))
			.first();

		if (!user) {
			const userId = await ctx.db.insert('users', {
				clerkUserId: identity.subject,
				...(displayName ? { displayName } : {}),
				createdAt: now,
				updatedAt: now
			});
			user = await ctx.db.get(userId);
		}

		if (!user) {
			throw new Error('Unable to initialize user.');
		}

		const workspace = await getWorkspaceForUser(ctx, user);
		const identityMetadata = getIdentityMetadata(identity);

		return workspace
			? { user, workspace, ...identityMetadata }
			: { ...(await createWorkspaceForUser(ctx, user, now)), ...identityMetadata };
	}
});

export const saveOnboardingCompany = mutation({
	args: {
		companyName: v.string(),
		companyWebsite: v.string()
	},
	handler: async (ctx, { companyName, companyWebsite }): Promise<ViewerWorkspace> => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { workspace } = viewerWorkspace;
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

		return { ...viewerWorkspace, workspace: updatedWorkspace };
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

		return {
			user,
			workspace: await getWorkspaceForUser(ctx, user),
			...getIdentityMetadata(identity)
		};
	}
});

export const markOnboardingComplete = mutation({
	args: {},
	handler: async (ctx) => {
		const { workspace } = await requireViewerWorkspace(ctx);
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
