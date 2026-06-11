import type { ViewerIdentity } from '../../domain/viewer';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';
import { isSupportedCompanyIndustry } from '../../domain/company-industries';

export type { ViewerIdentity } from '../../domain/viewer';

export type ViewerWorkspace = {
	admin: Doc<'admins'>;
	workspace: Doc<'workspaces'>;
	identity: ViewerIdentity;
};

export type ViewerAccountState =
	| { kind: 'signedOut' }
	| { kind: 'deleted' }
	| { kind: 'needsOnboarding'; identity: ViewerIdentity }
	| {
			kind: 'onboardingIncomplete';
			admin: Doc<'admins'>;
			workspace: Doc<'workspaces'>;
			identity: ViewerIdentity;
	  }
	| {
			kind: 'ready';
			admin: Doc<'admins'>;
			workspace: Doc<'workspaces'>;
			identity: ViewerIdentity;
	  };

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

async function getAdminForClerkUserId(ctx: QueryCtx | MutationCtx, clerkUserId: string) {
	return await ctx.db
		.query('admins')
		.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', clerkUserId))
		.first();
}

async function getDeletedClerkUser(ctx: QueryCtx | MutationCtx, clerkUserId: string) {
	return await ctx.db
		.query('deletedClerkUsers')
		.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', clerkUserId))
		.first();
}

async function ensureClerkUserWasNotDeleted(ctx: QueryCtx | MutationCtx, clerkUserId: string) {
	if (await getDeletedClerkUser(ctx, clerkUserId)) {
		throw new Error('This account has been deleted.');
	}
}

export async function getWorkspaceForAdmin(ctx: QueryCtx | MutationCtx, admin: Doc<'admins'>) {
	return await ctx.db
		.query('workspaces')
		.withIndex('by_adminId', (q) => q.eq('adminId', admin._id))
		.first();
}

async function createWorkspaceForAdmin(ctx: MutationCtx, admin: Doc<'admins'>, now: number) {
	const workspaceId = await ctx.db.insert('workspaces', {
		name: '',
		industry: '',
		adminId: admin._id,
		createdAt: now,
		updatedAt: now
	});

	const workspace = await ctx.db.get(workspaceId);

	if (!workspace) {
		throw new Error('Unable to initialize workspace.');
	}

	return { admin, workspace };
}

function hasCompletedWorkspaceProfile(workspace: Doc<'workspaces'>) {
	return Boolean(workspace.name.trim()) && isSupportedCompanyIndustry(workspace.industry.trim());
}

async function requireInitializedViewerWorkspace(
	ctx: QueryCtx | MutationCtx
): Promise<ViewerWorkspace> {
	const viewer = await requireSignedInClerkViewer(ctx);
	await ensureClerkUserWasNotDeleted(ctx, viewer.clerkUserId);
	const admin = await getAdminForClerkUserId(ctx, viewer.clerkUserId);

	if (!admin) {
		throw new Error('Admin has not been initialized.');
	}

	const workspace = await getWorkspaceForAdmin(ctx, admin);

	if (!workspace) {
		throw new Error('Workspace required.');
	}

	return { admin, workspace, identity: viewer.identity };
}

export async function requireViewerWorkspace(ctx: QueryCtx | MutationCtx): Promise<ViewerWorkspace> {
	const viewerWorkspace = await requireInitializedViewerWorkspace(ctx);

	if (
		!viewerWorkspace.workspace.onboardingCompletedAt ||
		!hasCompletedWorkspaceProfile(viewerWorkspace.workspace)
	) {
		throw new Error('Onboarding required.');
	}

	return viewerWorkspace;
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

async function ensureOnboardingWorkspaceRecord(ctx: MutationCtx): Promise<ViewerWorkspace> {
	const viewer = await requireSignedInClerkViewer(ctx);
	await ensureClerkUserWasNotDeleted(ctx, viewer.clerkUserId);
	const now = Date.now();
	let admin = await ctx.db
		.query('admins')
		.withIndex('by_clerkUserId', (q) => q.eq('clerkUserId', viewer.clerkUserId))
		.first();

	if (!admin) {
		const adminId = await ctx.db.insert('admins', {
			clerkUserId: viewer.clerkUserId,
			...(viewer.initialDisplayName ? { displayName: viewer.initialDisplayName } : {}),
			createdAt: now,
			updatedAt: now
		});
		admin = await ctx.db.get(adminId);
	}

	if (!admin) {
		throw new Error('Unable to initialize admin.');
	}

	const workspace = await getWorkspaceForAdmin(ctx, admin);

	return workspace
		? { admin, workspace, identity: viewer.identity }
		: { ...(await createWorkspaceForAdmin(ctx, admin, now)), identity: viewer.identity };
}

export async function saveOnboardingCompanyProfile(
	ctx: MutationCtx,
	{
		companyName,
		companyIndustry
	}: {
		companyName: string;
		companyIndustry: string;
	}
): Promise<ViewerWorkspace> {
	const name = companyName.trim();
	const industry = companyIndustry.trim();

	if (!name || !isSupportedCompanyIndustry(industry)) {
		throw new Error('Company name and supported industry are required.');
	}

	const viewerWorkspace = await ensureOnboardingWorkspaceRecord(ctx);
	const { workspace } = viewerWorkspace;

	await ctx.db.patch(workspace._id, {
		name,
		industry,
		updatedAt: Date.now()
	});

	const updatedWorkspace = await ctx.db.get(workspace._id);

	if (!updatedWorkspace) {
		throw new Error('Unable to save company profile.');
	}

	return { ...viewerWorkspace, workspace: updatedWorkspace };
}

export async function getViewerAccountState(ctx: QueryCtx | MutationCtx): Promise<ViewerAccountState> {
	const viewer = await getCurrentSignedInClerkViewer(ctx);

	if (!viewer) {
		return { kind: 'signedOut' };
	}

	if (await getDeletedClerkUser(ctx, viewer.clerkUserId)) {
		return { kind: 'deleted' };
	}

	const admin = await getAdminForClerkUserId(ctx, viewer.clerkUserId);

	if (!admin) {
		return { kind: 'needsOnboarding', identity: viewer.identity };
	}

	const workspace = await getWorkspaceForAdmin(ctx, admin);

	if (!workspace) {
		return { kind: 'needsOnboarding', identity: viewer.identity };
	}

	if (!workspace.onboardingCompletedAt || !hasCompletedWorkspaceProfile(workspace)) {
		return { kind: 'onboardingIncomplete', admin, workspace, identity: viewer.identity };
	}

	return { kind: 'ready', admin, workspace, identity: viewer.identity };
}

export async function markWorkspaceOnboardingComplete(ctx: MutationCtx) {
	const { workspace } = await requireInitializedViewerWorkspace(ctx);
	const now = Date.now();

	if (!hasCompletedWorkspaceProfile(workspace)) {
		throw new Error('Company profile is required before onboarding can be completed.');
	}

	if (!workspace.onboardingCompletedAt) {
		await ctx.db.patch(workspace._id, {
			onboardingCompletedAt: now,
			updatedAt: now
		});
	}

	return { onboardingCompletedAt: workspace.onboardingCompletedAt ?? now };
}
