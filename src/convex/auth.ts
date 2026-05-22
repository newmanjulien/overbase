import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
	ensureViewerWorkspaceRecord,
	getCurrentUserAndWorkspace,
	markWorkspaceOnboardingComplete,
	saveOnboardingCompanyProfile,
	type CurrentUserAndWorkspace,
	type ViewerWorkspace
} from '../backend/auth/viewer';

export const ensureViewerWorkspace = mutation({
	args: {},
	handler: async (ctx): Promise<ViewerWorkspace> => await ensureViewerWorkspaceRecord(ctx)
});

export const saveOnboardingCompany = mutation({
	args: {
		companyName: v.string(),
		companyWebsite: v.string()
	},
	handler: async (ctx, args): Promise<ViewerWorkspace> =>
		await saveOnboardingCompanyProfile(ctx, args)
});

export const currentUserAndWorkspace = query({
	args: {},
	handler: async (ctx): Promise<CurrentUserAndWorkspace> => await getCurrentUserAndWorkspace(ctx)
});

export const markOnboardingComplete = mutation({
	args: {},
	handler: async (ctx) => await markWorkspaceOnboardingComplete(ctx)
});
