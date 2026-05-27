import { v } from 'convex/values';
import { getVisiblePrimaryEmailDraftArtifact } from '@overbase/builder-sdk/artifacts';
import { normalizeEmailDraft } from '@overbase/builder-sdk/email';
import { mutation, query } from './_generated/server';
import { getAuthorizedSession } from '../backend/builder-sessions/records';
import { emailDraft as emailDraftValidator } from '../backend/validators/email-drafts';
import { emailFormatRecipientRef } from '../backend/validators/recipients';
import {
	getDefaultEmailFormatRecipientRefs,
	getFormatRecipients,
	normalizeEmailFormatRecipientRefs
} from '../backend/email-formats/recipients';
import { deleteEmailFormatRecordTree } from '../backend/email-formats/deletion';
import {
	getEmailFormatCreator,
	normalizeEmailFormatTitle
} from '../backend/email-formats/email-formats';
import {
	getEmailFormatReadiness,
	normalizeEmailFormatRules
} from '../backend/email-formats/readiness';
import { getViewerWorkspaceRecord, requireViewerWorkspace } from '../backend/auth/viewer';

const emailFormatRule = v.object({
	id: v.string(),
	text: v.string()
});

export const publishFromBuilderSession = mutation({
	args: {
		sessionId: v.id('builderSessions'),
		title: v.string()
	},
	handler: async (ctx, { sessionId, title }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { user, workspace } = viewerWorkspace;
		const now = Date.now();
		const emailFormatTitle = normalizeEmailFormatTitle(title);
		const session = await getAuthorizedSession(ctx, sessionId, now, viewerWorkspace);

		if (!session) {
			throw new Error('Builder session not found.');
		}

		const artifact = getVisiblePrimaryEmailDraftArtifact(session.artifacts);

		if (!artifact) {
			throw new Error('Email draft not found.');
		}

		const emailDraft = normalizeEmailDraft(artifact.value);
		const emailFormatId = await ctx.db.insert('emailFormats', {
			workspaceId: workspace._id,
			title: emailFormatTitle,
			status: 'paused',
			definition: {
				kind: 'customEmail',
				builderAppSlug: session.appSlug
			},
			emailDraft,
			emailDraftVersion: 1,
			rules: [],
			recipientRefs: getDefaultEmailFormatRecipientRefs(user._id),
			createdByUserId: user._id,
			createdAt: now,
			updatedAt: now
		});
		const emailFormat = await ctx.db.get(emailFormatId);

		if (!emailFormat) {
			throw new Error('Email format not found after publish.');
		}

		return emailFormat;
	}
});

export const getEmailFormatDetail = query({
	args: {
		emailFormatId: v.id('emailFormats')
	},
	handler: async (ctx, { emailFormatId }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const emailFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(emailFormatId));

		if (!emailFormat) {
			return null;
		}

		const people = await getFormatRecipients(ctx, viewerWorkspace);
		const sentEmailDocs = await ctx.db
			.query('sentEmails')
			.withIndex('by_workspace_emailFormat_sentAt', (q) =>
				q
					.eq('workspaceId', emailFormat.workspaceId)
					.eq('emailFormatId', emailFormatId)
			)
			.order('desc')
			.collect();
		const sentEmails = sentEmailDocs.map((sentEmail) => ({
			id: sentEmail._id,
			sentAt: new Date(sentEmail.sentAt).toISOString(),
			draft: sentEmail.emailDraft
		}));
		const feedbackDocs = await ctx.db
			.query('emailFeedback')
			.withIndex('by_workspace_emailFormat', (q) =>
				q
					.eq('workspaceId', emailFormat.workspaceId)
					.eq('emailFormatId', emailFormatId)
			)
			.collect();
		const feedback = feedbackDocs.map((feedbackItem) => ({
			sentEmailId: feedbackItem.sentEmailId,
			likedText: feedbackItem.likedText,
			improvementText: feedbackItem.improvementText
		}));
		const feedbackUpdatedAt = feedbackDocs.reduce(
			(updatedAt, feedbackItem) => Math.max(updatedAt, feedbackItem.updatedAt),
			0
		);
		const rules = normalizeEmailFormatRules(emailFormat.rules);

		return {
			emailFormat: {
				id: emailFormat._id,
				title: emailFormat.title,
				status: emailFormat.status,
				definition: emailFormat.definition,
				emailDraft: emailFormat.emailDraft,
				emailDraftVersion: emailFormat.emailDraftVersion,
				rules,
				readiness: getEmailFormatReadiness(rules),
				recipientRefs: await normalizeEmailFormatRecipientRefs(
					ctx,
					emailFormat.recipientRefs,
					viewerWorkspace
				),
				creator: await getEmailFormatCreator(
					ctx,
					emailFormat.createdByUserId,
					viewerWorkspace
				),
				createdAt: emailFormat.createdAt,
				updatedAt: emailFormat.updatedAt
			},
			people,
			sentEmails,
			feedback,
			feedbackUpdatedAt
		};
	}
});

export const updateEmailFormatTitle = mutation({
	args: {
		emailFormatId: v.id('emailFormats'),
		title: v.string()
	},
	handler: async (ctx, { emailFormatId, title }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const emailFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(emailFormatId));

		if (!emailFormat) {
			throw new Error('Email format not found.');
		}

		const emailFormatTitle = normalizeEmailFormatTitle(title);

		await ctx.db.patch(emailFormatId, {
			title: emailFormatTitle,
			updatedAt: Date.now()
		});

		return {
			title: emailFormatTitle
		};
	}
});

export const listEmailFormats = query({
	args: {},
	handler: async (ctx) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { workspace } = viewerWorkspace;
		const emailFormats = await ctx.db
			.query('emailFormats')
			.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspace._id))
			.order('desc')
			.collect();

		return await Promise.all(
			emailFormats.map(async (emailFormat) => ({
				id: emailFormat._id,
				title: emailFormat.title,
				status: emailFormat.status,
				readiness: getEmailFormatReadiness(emailFormat.rules),
				creator: await getEmailFormatCreator(
					ctx,
					emailFormat.createdByUserId,
					viewerWorkspace
				),
				createdAt: emailFormat.createdAt
			}))
		);
	}
});

export const deleteEmailFormats = mutation({
	args: {
		emailFormatIds: v.array(v.id('emailFormats'))
	},
	handler: async (ctx, { emailFormatIds }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);

		for (const emailFormatId of emailFormatIds) {
			const emailFormat = await getViewerWorkspaceRecord(
				viewerWorkspace,
				await ctx.db.get(emailFormatId)
			);
			if (!emailFormat) {
				continue;
			}

			await deleteEmailFormatRecordTree(ctx, emailFormat);
		}
	}
});

export const setEmailFormatStatus = mutation({
	args: {
		emailFormatId: v.id('emailFormats'),
		status: v.union(v.literal('paused'), v.literal('active'))
	},
	handler: async (ctx, { emailFormatId, status }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const emailFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(emailFormatId));

		if (!emailFormat) {
			throw new Error('Email format not found.');
		}

		const readiness = getEmailFormatReadiness(emailFormat.rules);

		if (status === 'active' && !readiness.canActivate) {
			throw new Error(
				readiness.activationBlockers[0]?.message ?? 'Email format is not ready to activate.'
			);
		}

		const updatedAt = Date.now();

		await ctx.db.patch(emailFormatId, {
			status,
			updatedAt
		});

		return {
			status,
			updatedAt
		};
	}
});

export const saveEmailFormatEmailDraft = mutation({
	args: {
		emailFormatId: v.id('emailFormats'),
		baseEmailDraftVersion: v.number(),
		draft: emailDraftValidator
	},
	handler: async (ctx, { emailFormatId, baseEmailDraftVersion, draft }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const emailFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(emailFormatId));

		if (!emailFormat) {
			throw new Error('Email format not found.');
		}

		if (emailFormat.emailDraftVersion !== baseEmailDraftVersion) {
			throw new Error('This email format was changed elsewhere. Reload and try again.');
		}

		const now = Date.now();
		const nextVersion = emailFormat.emailDraftVersion + 1;
		const emailDraft = normalizeEmailDraft(draft);

		await ctx.db.patch(emailFormatId, {
			emailDraft,
			emailDraftVersion: nextVersion,
			updatedAt: now
		});

		return {
			emailDraft,
			emailDraftVersion: nextVersion
		};
	}
});

export const saveEmailFormatRules = mutation({
	args: {
		emailFormatId: v.id('emailFormats'),
		rules: v.array(emailFormatRule)
	},
	handler: async (ctx, { emailFormatId, rules }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const emailFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(emailFormatId));

		if (!emailFormat) {
			throw new Error('Email format not found.');
		}

		const now = Date.now();
		const normalizedRules = normalizeEmailFormatRules(rules);
		const readiness = getEmailFormatReadiness(normalizedRules);
		const status =
			emailFormat.status === 'active' && !readiness.canActivate
				? 'paused'
				: emailFormat.status;

		await ctx.db.patch(emailFormatId, {
			rules: normalizedRules,
			status,
			updatedAt: now
		});

		return {
			rules: normalizedRules,
			status,
			updatedAt: now
		};
	}
});

export const setEmailFormatRecipients = mutation({
	args: {
		emailFormatId: v.id('emailFormats'),
		recipientRefs: v.array(emailFormatRecipientRef)
	},
	handler: async (ctx, { emailFormatId, recipientRefs }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const emailFormat = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(emailFormatId));

		if (!emailFormat) {
			throw new Error('Email format not found.');
		}

		const now = Date.now();
		const nextRecipientRefs = await normalizeEmailFormatRecipientRefs(
			ctx,
			recipientRefs,
			viewerWorkspace
		);

		await ctx.db.patch(emailFormatId, {
			recipientRefs: nextRecipientRefs,
			updatedAt: now
		});

		return {
			recipientRefs: nextRecipientRefs,
			updatedAt: now
		};
	}
});

export const saveEmailFeedback = mutation({
	args: {
		sentEmailId: v.id('sentEmails'),
		likedText: v.string(),
		improvementText: v.string()
	},
	handler: async (ctx, { sentEmailId, likedText, improvementText }) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const sentEmail = await getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(sentEmailId));

		if (!sentEmail) {
			throw new Error('Sent email not found.');
		}

		const now = Date.now();
		const normalizedFeedback = {
			likedText: likedText.trim(),
			improvementText: improvementText.trim()
		};
		const existingFeedback = await ctx.db
			.query('emailFeedback')
			.withIndex('by_workspace_sentEmail', (q) =>
				q.eq('workspaceId', sentEmail.workspaceId).eq('sentEmailId', sentEmailId)
			)
			.first();

		if (existingFeedback) {
			await ctx.db.patch(existingFeedback._id, {
				...normalizedFeedback,
				updatedAt: now
			});

			return normalizedFeedback;
		}

		await ctx.db.insert('emailFeedback', {
			workspaceId: sentEmail.workspaceId,
			emailFormatId: sentEmail.emailFormatId,
			sentEmailId,
			...normalizedFeedback,
			createdAt: now,
			updatedAt: now
		});

		return normalizedFeedback;
	}
});
