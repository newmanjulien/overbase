import type { ViewerIdentity } from '../../domain/viewer';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';

export type { ViewerIdentity } from '../../domain/viewer';

export type ViewerWorkspace = {
	user: Doc<'users'>;
	workspace: Doc<'workspaces'>;
	identity: ViewerIdentity;
};

export type CurrentUserAndWorkspace = {
	user: Doc<'users'>;
	workspace: Doc<'workspaces'> | null;
	identity: ViewerIdentity;
} | null;

type ClerkIdentity = NonNullable<Awaited<ReturnType<QueryCtx['auth']['getUserIdentity']>>>;

type SignedInClerkViewer = {
	clerkUserId: string;
	identity: ViewerIdentity;
	initialDisplayName?: string;
};

function getSignedInClerkViewer(identity: ClerkIdentity): SignedInClerkViewer {
	const clerkUserId = identity.subject?.trim();
	const email = identity.email?.trim();
	const initialDisplayName = identity.name?.trim() || undefined;

	if (!clerkUserId) {
		throw new Error('Authentication required.');
	}

	if (!email) {
		throw new Error("Clerk Convex JWT template must include the user's email address.");
	}

	return {
		clerkUserId,
		identity: { email },
		...(initialDisplayName ? { initialDisplayName } : {})
	};
}

async function requireSignedInClerkViewer(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		throw new Error('Authentication required.');
	}

	return getSignedInClerkViewer(identity);
}

async function getCurrentSignedInClerkViewer(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		return null;
	}

	return getSignedInClerkViewer(identity);
}

async function getUserForClerkUserId(ctx: QueryCtx | MutationCtx, clerkUserId: string) {
	return await ctx.db
		.query('users')
		.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', clerkUserId))
		.first();
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
	const viewer = await requireSignedInClerkViewer(ctx);
	const user = await getUserForClerkUserId(ctx, viewer.clerkUserId);

	if (!user) {
		throw new Error('User has not been initialized.');
	}

	const workspace = await getWorkspaceForUser(ctx, user);

	if (!workspace) {
		throw new Error('Workspace required.');
	}

	return { user, workspace, identity: viewer.identity };
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

export async function ensureViewerWorkspaceRecord(ctx: MutationCtx): Promise<ViewerWorkspace> {
	const viewer = await requireSignedInClerkViewer(ctx);
	const now = Date.now();
	let user = await ctx.db
		.query('users')
		.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', viewer.clerkUserId))
		.first();

	if (!user) {
		const userId = await ctx.db.insert('users', {
			clerkUserId: viewer.clerkUserId,
			...(viewer.initialDisplayName ? { displayName: viewer.initialDisplayName } : {}),
			createdAt: now,
			updatedAt: now
		});
		user = await ctx.db.get(userId);
	}

	if (!user) {
		throw new Error('Unable to initialize user.');
	}

	const workspace = await getWorkspaceForUser(ctx, user);

	return workspace
		? { user, workspace, identity: viewer.identity }
		: { ...(await createWorkspaceForUser(ctx, user, now)), identity: viewer.identity };
}

export async function saveOnboardingCompanyProfile(
	ctx: MutationCtx,
	{
		companyName,
		companyWebsite
	}: {
		companyName: string;
		companyWebsite: string;
	}
): Promise<ViewerWorkspace> {
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

export async function getCurrentUserAndWorkspace(
	ctx: QueryCtx | MutationCtx
): Promise<CurrentUserAndWorkspace> {
	const viewer = await getCurrentSignedInClerkViewer(ctx);

	if (!viewer) {
		return null;
	}

	const user = await getUserForClerkUserId(ctx, viewer.clerkUserId);

	if (!user) {
		return null;
	}

	return {
		user,
		workspace: await getWorkspaceForUser(ctx, user),
		identity: viewer.identity
	};
}

export async function markWorkspaceOnboardingComplete(ctx: MutationCtx) {
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
