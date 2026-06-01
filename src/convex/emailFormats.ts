import {
	getViewerWorkspaceRecord,
	requireViewerWorkspace,
	type ViewerWorkspace
} from '../backend/auth/viewer';
import {
	normalizeEmailFormatContent,
	normalizeEmailFormatRules,
	normalizeSelectedAnswers,
	toEditableEmailFormatContent
} from '../backend/email-formats/content';
import {
	insertLinkedinContactsForEmailFormat,
	normalizeLinkedinContactsSource
} from '../backend/email-formats/linkedin-contacts';
import {
	collectEmailFormatRecipientRows,
	deleteEmailFormatRecipientRows,
	replaceEmailFormatRecipientRows
} from '../backend/email-formats/recipients';
import {
	deleteEmailFormatsInput,
	emailFormatCreateFromBuilderInput,
	emailFormatId,
	setEmailFormatStatusInput,
	updateEmailFormatContentInput,
	updateEmailFormatRecipientsInput,
	updateEmailFormatRulesInput
} from '../backend/validators/email-formats';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { mutation, query } from './_generated/server';
import { getTeammateDisplayName } from './teammateIdentity';

function getCreatorDisplayName(creator: Doc<'users'> | null) {
	return creator?.displayName?.trim() || 'Unknown user';
}

async function getEmailFormatInViewerWorkspace(
	ctx: QueryCtx | MutationCtx,
	viewerWorkspace: ViewerWorkspace,
	emailFormatId: Id<'emailFormats'>
) {
	return getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(emailFormatId));
}

async function deleteLinkedinContactRows(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	emailFormatId: Id<'emailFormats'>
) {
	const contacts = await ctx.db
		.query('emailFormatLinkedinContacts')
		.withIndex('by_workspace_emailFormat', (q) =>
			q.eq('workspaceId', workspaceId).eq('emailFormatId', emailFormatId)
		)
		.collect();

	for (const contact of contacts) {
		await ctx.db.delete(contact._id);
	}
}

export const createEmailFormatFromBuilder = mutation({
	args: emailFormatCreateFromBuilderInput,
	handler: async (ctx, args) => {
		const { user, workspace } = await requireViewerWorkspace(ctx);
		const builderSlug = args.builderSlug.trim();
		const content = normalizeEmailFormatContent({
			title: args.title,
			to: args.to,
			cc: args.cc,
			attachment: args.attachment,
			body: args.body
		});
		const now = Date.now();
		const linkedinContactsSource = normalizeLinkedinContactsSource(
			args.linkedinContactsSource,
			now
		);

		if (!builderSlug) {
			throw new Error('Builder slug is required.');
		}

		if (!content.title) {
			throw new Error('Email format title is required.');
		}

		if (content.body.length === 0) {
			throw new Error('Email format body is required.');
		}

		const emailFormatId = await ctx.db.insert('emailFormats', {
			workspaceId: workspace._id,
			creatorUserId: user._id,
			builderSlug,
			builderMode: args.builderMode,
			startingPointId: args.startingPointId?.trim() || null,
			selectedAnswers: normalizeSelectedAnswers(args.selectedAnswers),
			status: 'paused',
			title: content.title,
			to: content.to,
			cc: content.cc,
			attachment: content.attachment,
			body: content.body,
			emailDraftVersion: 1,
			recipientCount: 0,
			rules: args.builderMode === 'internal-data' ? [] : normalizeEmailFormatRules(args.rules),
			linkedinContactsSummary: linkedinContactsSource?.summary ?? null,
			createdAt: now,
			updatedAt: now
		});

		await insertLinkedinContactsForEmailFormat(ctx, {
			workspaceId: workspace._id,
			emailFormatId,
			contactsSource: linkedinContactsSource,
			createdAt: now
		});

		return { emailFormatId };
	}
});

export const listEmailFormats = query({
	args: {},
	handler: async (ctx) => {
		const { workspace } = await requireViewerWorkspace(ctx);
		const formats = await ctx.db
			.query('emailFormats')
			.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspace._id))
			.order('desc')
			.collect();

		return await Promise.all(
			formats.map(async (format) => {
				const creator = await ctx.db.get(format.creatorUserId);

				return {
					id: format._id,
					title: format.title,
					status: format.status,
					createdAt: format.createdAt,
					creator: {
						name: getCreatorDisplayName(creator),
						avatarUrl: creator?.avatar?.url ?? ''
					}
				};
			})
		);
	}
});

export const getEmailFormatDetail = query({
	args: {
		emailFormatId
	},
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { user, workspace, identity } = viewerWorkspace;
		const format = await getEmailFormatInViewerWorkspace(
			ctx,
			viewerWorkspace,
			args.emailFormatId
		);

		if (!format) {
			return null;
		}

		const [recipientRows, teammates] = await Promise.all([
			collectEmailFormatRecipientRows(ctx, workspace._id, format._id),
			ctx.db
				.query('teammates')
				.withIndex('by_workspace_createdAt', (q) => q.eq('workspaceId', workspace._id))
				.order('desc')
				.collect()
		]);

		return {
			emailFormat: {
				id: format._id,
				builderSlug: format.builderSlug,
				builderMode: format.builderMode,
				status: format.status,
				content: toEditableEmailFormatContent(format),
				emailDraftVersion: format.emailDraftVersion,
				rules: format.rules,
				recipientRefs: recipientRows.map((row) => row.recipient),
				linkedinContactsSummary: format.linkedinContactsSummary,
				updatedAt: format.updatedAt
			},
			recipientPickerPeople: [
				{
					id: `user:${user._id}`,
					name: user.displayName?.trim() || identity.email,
					avatarUrl: user.avatar?.url ?? ''
				},
				...teammates.map((teammate) => ({
					id: `teammate:${teammate._id}`,
					name: getTeammateDisplayName(teammate),
					avatarUrl: ''
				}))
			],
			feedback: [],
			feedbackUpdatedAt: 0,
			sentEmails: []
		};
	}
});

export const updateEmailFormatContent = mutation({
	args: updateEmailFormatContentInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const format = await getEmailFormatInViewerWorkspace(
			ctx,
			viewerWorkspace,
			args.emailFormatId
		);

		if (!format) {
			throw new Error('Email format not found.');
		}

		if (format.emailDraftVersion !== args.baseEmailDraftVersion) {
			throw new Error('Email format has changed. Reload and try again.');
		}

		const content = normalizeEmailFormatContent({
			title: args.title,
			to: args.to,
			cc: args.cc,
			attachment: args.attachment,
			body: args.body
		});

		if (!content.title) {
			throw new Error('Email format title is required.');
		}

		if (content.body.length === 0) {
			throw new Error('Email format body is required.');
		}

		const now = Date.now();
		const emailDraftVersion = format.emailDraftVersion + 1;

		await ctx.db.patch(args.emailFormatId, {
			title: content.title,
			to: content.to,
			cc: content.cc,
			attachment: content.attachment,
			body: content.body,
			emailDraftVersion,
			updatedAt: now
		});

		const updatedFormat = await ctx.db.get(args.emailFormatId);

		if (!updatedFormat) {
			throw new Error('Unable to save email format.');
		}

		return {
			content: toEditableEmailFormatContent(updatedFormat),
			emailDraftVersion,
			updatedAt: now
		};
	}
});

export const updateEmailFormatRules = mutation({
	args: updateEmailFormatRulesInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const format = await getEmailFormatInViewerWorkspace(
			ctx,
			viewerWorkspace,
			args.emailFormatId
		);

		if (!format) {
			throw new Error('Email format not found.');
		}

		const rules = normalizeEmailFormatRules(args.rules);
		const now = Date.now();

		await ctx.db.patch(args.emailFormatId, {
			rules,
			updatedAt: now
		});

		return { rules, updatedAt: now };
	}
});

export const updateEmailFormatRecipients = mutation({
	args: updateEmailFormatRecipientsInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const format = await getEmailFormatInViewerWorkspace(
			ctx,
			viewerWorkspace,
			args.emailFormatId
		);

		if (!format) {
			throw new Error('Email format not found.');
		}

		const now = Date.now();
		const recipientRefs = await replaceEmailFormatRecipientRows(
			ctx,
			viewerWorkspace,
			args.emailFormatId,
			args.recipientRefs,
			now
		);

		return { recipientRefs, updatedAt: now };
	}
});

export const setEmailFormatStatus = mutation({
	args: setEmailFormatStatusInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const format = await getEmailFormatInViewerWorkspace(
			ctx,
			viewerWorkspace,
			args.emailFormatId
		);

		if (!format) {
			throw new Error('Email format not found.');
		}

		if (args.status === 'active') {
			if (format.recipientCount === 0) {
				throw new Error('Add at least one recipient before activating this format.');
			}

			if (normalizeEmailFormatRules(format.rules).length === 0) {
				throw new Error('Add at least one rule before activating this format.');
			}
		}

		const now = Date.now();

		await ctx.db.patch(args.emailFormatId, {
			status: args.status,
			updatedAt: now
		});

		return { status: args.status, updatedAt: now };
	}
});

export const deleteEmailFormats = mutation({
	args: deleteEmailFormatsInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);

		for (const emailFormatId of new Set(args.emailFormatIds)) {
			const format = await getEmailFormatInViewerWorkspace(
				ctx,
				viewerWorkspace,
				emailFormatId
			);

			if (!format) {
				throw new Error('Email format not found.');
			}

			await deleteEmailFormatRecipientRows(ctx, viewerWorkspace.workspace._id, emailFormatId);
			await deleteLinkedinContactRows(ctx, viewerWorkspace.workspace._id, emailFormatId);
			await ctx.db.delete(emailFormatId);
		}
	}
});
