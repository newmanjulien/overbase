import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
	builderRunSetup
} from '../backend/validators/builder-protocol';
import { emailDraft as emailDraftValidator } from '../backend/validators/email-drafts';
import {
	getBuilderSessionSnapshot,
	resumeBuilderSession,
	saveBuilderSessionEmailDraft,
	sendBuilderSessionMessage,
	startBuilderSession
} from '../backend/builder-sessions/lifecycle';

export const startSession = mutation({
	args: {
		appSlug: v.string(),
		setup: builderRunSetup,
		startRequestId: v.optional(v.string())
	},
	handler: async (ctx, args) => await startBuilderSession(ctx, args)
});

export const resumeSession = mutation({
	args: {
		sessionId: v.id('builderSessions')
	},
	handler: async (ctx, { sessionId }) => await resumeBuilderSession(ctx, sessionId)
});

export const getSessionSnapshot = query({
	args: {
		sessionId: v.id('builderSessions')
	},
	handler: async (ctx, { sessionId }) => await getBuilderSessionSnapshot(ctx, sessionId)
});

export const sendMessage = mutation({
	args: {
		sessionId: v.id('builderSessions'),
		text: v.string()
	},
	handler: async (ctx, args) => await sendBuilderSessionMessage(ctx, args)
});

export const saveEmailDraft = mutation({
	args: {
		sessionId: v.id('builderSessions'),
		baseEmailDraftVersion: v.number(),
		emailDraft: emailDraftValidator
	},
	handler: async (ctx, args) => await saveBuilderSessionEmailDraft(ctx, args)
});
