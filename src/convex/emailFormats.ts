import {
	getViewerWorkspaceRecord,
	requireViewerWorkspace,
	type ViewerWorkspace
} from '../backend/auth/viewer';
import {
	normalizeEmailFormatContent,
	normalizeEmailFormatRules,
	normalizeEmailFormatTitle,
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
	insertEmailFormatRecipientRows,
	replaceEmailFormatRecipientRows
} from '../backend/email-formats/recipients';
import {
	deleteEmailFormatsInput,
	emailFormatCreateFromStarterInput,
	emailFormatId,
	setEmailFormatStatusInput,
	updateEmailFormatContentInput,
	updateEmailFormatRecipientsInput,
	updateEmailFormatRulesInput,
	updateEmailFormatTitleInput
} from '../backend/validators/email-formats';
import {
	getEmailFormatDefinition,
	type EmailFormatDefinition,
	type EmailFormatRuleDataSourceAction
} from '../shared/email-format-definitions';
import { getEmailFormatActivationReadiness } from '../shared/email-format-activation';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { mutation, query } from './_generated/server';
import { getTeammateDisplayName } from './teammateIdentity';

function getCreatorDisplayName(creator: Doc<'users'> | null) {
	return creator?.displayName?.trim() || 'Unknown user';
}

function requireEmailFormatDefinition(formatDefinitionSlug: string): EmailFormatDefinition {
	const definition = getEmailFormatDefinition(formatDefinitionSlug.trim());

	if (!definition) {
		throw new Error('Email format definition not found.');
	}

	return definition;
}

function areJsonEqual(first: unknown, second: unknown) {
	return JSON.stringify(first) === JSON.stringify(second);
}

function assertLockedFieldUnchanged(
	fieldIsEditable: boolean,
	fieldLabel: string,
	currentValue: unknown,
	nextValue: unknown
) {
	if (!fieldIsEditable && !areJsonEqual(currentValue, nextValue)) {
		throw new Error(`${fieldLabel} is fixed for this email format.`);
	}
}

function areRuleListsEqual(firstRules: { id: string }[], secondRules: { id: string }[]) {
	return areJsonEqual(
		firstRules.map((rule) => rule.id),
		secondRules.map((rule) => rule.id)
	);
}

function areRuleTextsEqual(
	firstRules: { id: string; text: string }[],
	secondRules: { id: string; text: string }[]
) {
	const firstTextById = new Map(firstRules.map((rule) => [rule.id, rule.text]));

	return secondRules.every((rule) => firstTextById.get(rule.id) === rule.text);
}

async function getEmailFormatInViewerWorkspace(
	ctx: QueryCtx | MutationCtx,
	viewerWorkspace: ViewerWorkspace,
	emailFormatId: Id<'emailFormats'>
) {
	return getViewerWorkspaceRecord(viewerWorkspace, await ctx.db.get(emailFormatId));
}

function getRuleDataSourceAction(
	formatDefinition: EmailFormatDefinition,
	linkedinContactsSummary: Doc<'emailFormats'>['linkedinContactsSummary']
): EmailFormatRuleDataSourceAction {
	if (linkedinContactsSummary) {
		return { label: 'LinkedIn contacts added', disabled: true };
	}

	return formatDefinition.dataMode === 'public-data'
		? formatDefinition.ruleDataSourceAction
		: { label: 'Link data sources' };
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

export const createEmailFormatFromStarter = mutation({
	args: emailFormatCreateFromStarterInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { user, workspace } = viewerWorkspace;
		const formatDefinition = requireEmailFormatDefinition(args.formatDefinitionSlug);
		const createdFromStarterSlug = args.createdFromStarterSlug.trim();
		const title = normalizeEmailFormatTitle(args.title);
		const content = normalizeEmailFormatContent({
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

		if (!createdFromStarterSlug) {
			throw new Error('Format starter slug is required.');
		}

		if (!title) {
			throw new Error('Email format title is required.');
		}

		if (content.body.length === 0) {
			throw new Error('Email format body is required.');
		}

		const emailFormatId = await ctx.db.insert('emailFormats', {
			workspaceId: workspace._id,
			creatorUserId: user._id,
			formatDefinitionSlug: formatDefinition.slug,
			createdFromStarterSlug,
			startingPointId: args.startingPointId?.trim() || null,
			selectedAnswers: normalizeSelectedAnswers(args.selectedAnswers),
			status: 'paused',
			lastActivatedAt: null,
			title,
			titleVersion: 1,
			to: content.to,
			cc: content.cc,
			attachment: content.attachment,
			body: content.body,
			emailContentVersion: 1,
			recipientCount: 0,
			rules:
				formatDefinition.dataMode === 'internal-data'
					? []
					: normalizeEmailFormatRules(args.rules),
			rulesVersion: 1,
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
		await insertEmailFormatRecipientRows(
			ctx,
			viewerWorkspace,
			emailFormatId,
			args.recipientRefs,
			now
		);

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
				const activationReadiness = getEmailFormatActivationReadiness({
					recipientCount: format.recipientCount,
					rules: format.rules
				});

				return {
					id: format._id,
					title: format.title,
					status: format.status,
					createdAt: format.createdAt,
					activation: {
						canActivate: activationReadiness.canActivate
					},
					creator: {
						name: getCreatorDisplayName(creator),
						avatarUrl: creator?.avatar?.url ?? ''
					}
				};
			})
		);
	}
});

export const getEmailFormatConfiguration = query({
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
		const formatDefinition = requireEmailFormatDefinition(format.formatDefinitionSlug);

		return {
			emailFormat: {
				id: format._id,
				formatDefinitionSlug: formatDefinition.slug,
				createdFromStarterSlug: format.createdFromStarterSlug,
				dataMode: formatDefinition.dataMode,
				status: format.status,
				lastActivatedAt: format.lastActivatedAt,
				title: {
					value: format.title,
					version: format.titleVersion
				},
				emailContent: {
					value: toEditableEmailFormatContent(format),
					version: format.emailContentVersion
				},
				rules: {
					value: format.rules,
					version: format.rulesVersion
				},
				recipientRefs: recipientRows.map((row) => row.recipient),
				linkedinContactsSummary: format.linkedinContactsSummary,
				updatedAt: format.updatedAt
			},
			formatDefinition: {
				slug: formatDefinition.slug,
				dataMode: formatDefinition.dataMode,
				variables: formatDefinition.variables,
				contentEditPolicy: formatDefinition.contentEditPolicy,
				rulesEditPolicy: formatDefinition.rulesEditPolicy,
				ruleDataSourceAction:
					getRuleDataSourceAction(formatDefinition, format.linkedinContactsSummary),
				ruleDataSourceModal:
					formatDefinition.dataMode === 'public-data'
						? (formatDefinition.ruleDataSourceModal ?? 'default')
						: 'default',
				ruleInfoCard: formatDefinition.ruleInfoCard ?? null
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

export const updateEmailFormatTitle = mutation({
	args: updateEmailFormatTitleInput,
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

		const formatDefinition = requireEmailFormatDefinition(format.formatDefinitionSlug);

		if (!formatDefinition.contentEditPolicy.title) {
			throw new Error('Title is fixed for this email format.');
		}

		if (format.titleVersion !== args.baseTitleVersion) {
			return {
				kind: 'stale' as const,
				title: {
					value: format.title,
					version: format.titleVersion
				}
			};
		}

		const title = normalizeEmailFormatTitle(args.title);

		if (!title) {
			throw new Error('Email format title is required.');
		}

		const now = Date.now();
		const titleVersion = format.titleVersion + 1;

		await ctx.db.patch(args.emailFormatId, {
			title,
			titleVersion,
			updatedAt: now
		});

		return {
			kind: 'saved' as const,
			title: {
				value: title,
				version: titleVersion
			}
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

		const formatDefinition = requireEmailFormatDefinition(format.formatDefinitionSlug);

		if (format.emailContentVersion !== args.baseEmailContentVersion) {
			return {
				kind: 'stale' as const,
				emailContent: {
					value: toEditableEmailFormatContent(format),
					version: format.emailContentVersion
				}
			};
		}

		const content = normalizeEmailFormatContent({
			to: args.to,
			cc: args.cc,
			attachment: args.attachment,
			body: args.body
		});
		const currentContent = normalizeEmailFormatContent({
			to: format.to,
			cc: format.cc,
			attachment: format.attachment,
			body: format.body
		});

		assertLockedFieldUnchanged(
			formatDefinition.contentEditPolicy.to,
			'Recipients',
			currentContent.to,
			content.to
		);
		assertLockedFieldUnchanged(
			formatDefinition.contentEditPolicy.cc,
			'Cc recipients',
			currentContent.cc,
			content.cc
		);
		assertLockedFieldUnchanged(
			formatDefinition.contentEditPolicy.attachment,
			'Attachment',
			currentContent.attachment,
			content.attachment
		);
		assertLockedFieldUnchanged(
			formatDefinition.contentEditPolicy.body,
			'Body',
			currentContent.body,
			content.body
		);

		if (content.body.length === 0) {
			throw new Error('Email format body is required.');
		}

		const now = Date.now();
		const emailContentVersion = format.emailContentVersion + 1;

		await ctx.db.patch(args.emailFormatId, {
			to: content.to,
			cc: content.cc,
			attachment: content.attachment,
			body: content.body,
			emailContentVersion,
			updatedAt: now
		});

		return {
			kind: 'saved' as const,
			emailContent: {
				value: content,
				version: emailContentVersion
			}
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

		const formatDefinition = requireEmailFormatDefinition(format.formatDefinitionSlug);

		if (format.rulesVersion !== args.baseRulesVersion) {
			return {
				kind: 'stale' as const,
				rules: {
					value: format.rules,
					version: format.rulesVersion
				}
			};
		}

		const rules = normalizeEmailFormatRules(args.rules);
		const currentRules = normalizeEmailFormatRules(format.rules);

		if (
			!formatDefinition.rulesEditPolicy.list &&
			!areRuleListsEqual(currentRules, rules)
		) {
			throw new Error('Rule list is fixed for this email format.');
		}

		if (
			!formatDefinition.rulesEditPolicy.text &&
			!areRuleTextsEqual(currentRules, rules)
		) {
			throw new Error('Rule text is fixed for this email format.');
		}

		if (areJsonEqual(currentRules, rules)) {
			return {
				kind: 'saved' as const,
				rules: {
					value: currentRules,
					version: format.rulesVersion
				}
			};
		}

		const now = Date.now();
		const rulesVersion = format.rulesVersion + 1;

		await ctx.db.patch(args.emailFormatId, {
			rules,
			rulesVersion,
			updatedAt: now
		});

		return {
			kind: 'saved' as const,
			rules: {
				value: rules,
				version: rulesVersion
			}
		};
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
			const readiness = getEmailFormatActivationReadiness({
				recipientCount: format.recipientCount,
				rules: format.rules
			});

			if (!readiness.canActivate) {
				throw new Error(readiness.message ?? 'Email format is not ready to activate.');
			}
		}

		const now = Date.now();

		await ctx.db.patch(args.emailFormatId, {
			status: args.status,
			...(args.status === 'active' ? { lastActivatedAt: now } : {}),
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
