import {
	getViewerWorkspaceRecord,
	requireViewerWorkspace,
	type ViewerWorkspace
} from '../backend/auth/viewer';
import {
	normalizeEmailFormatContent,
	normalizeEmailFormatRules,
	normalizeEmailFormatTitle,
	normalizeEmailFormatVariables,
	normalizeSelectedAnswers,
	toEditableEmailFormatContent
} from '../backend/email-formats/content';
import {
	createLinkedinContactsExternalDataSource,
	normalizeLinkedinContactsSource
} from '../backend/external-data/linkedin-contacts';
import {
	collectEmailFormatRecipientRows,
	deleteEmailFormatRecipientRows,
	insertEmailFormatRecipientRows,
	replaceEmailFormatRecipientRows
} from '../backend/email-formats/recipients';
import {
	collectEmailFormatExternalDataLinks,
	getRequiredDataSourceRequirementForRule,
	getEmailFormatActivationState,
	getEmailFormatDataSourceLinkState,
	getInitialRulesForEmailFormatSpec,
	getLinkedinContactsCreateLinkForEmailFormatSpec,
	getRuleDataSourceActions,
	requireEmailFormatSpecForFormat
} from '../backend/email-formats/activation';
import {
	addLinkedinContactsSourceToEmailFormatRuleInput,
	deleteEmailFormatsInput,
	emailFormatCreateFromStarterInput,
	linkExternalDataSourceToEmailFormatRuleInput,
	emailFormatId,
	setEmailFormatStatusInput,
	updateEmailFormatContentInput,
	updateEmailFormatRecipientsInput,
	updateEmailFormatRulesInput,
	updateEmailFormatTitleInput
} from '../backend/validators/email-formats';
import {
	getEmailFormatDefinition,
	getEmailFormatSpec,
	type EmailFormatDefinition
} from '../domain/email-formats';
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

type VersionedValue<Value> = {
	value: Value;
	version: number;
};

function versionedMutationResult<
	const Kind extends 'stale' | 'saved',
	const Key extends string,
	Value
>(kind: Kind, key: Key, value: Value, version: number) {
	return {
		kind,
		[key]: { value, version }
	} as { kind: Kind } & Record<Key, VersionedValue<Value>>;
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

async function insertEmailFormatExternalDataLink(
	ctx: MutationCtx,
	args: {
		workspaceId: Id<'workspaces'>;
		emailFormatId: Id<'emailFormats'>;
		ruleId: string;
		externalDataSourceId: Id<'externalDataSources'>;
		createdAt: number;
	}
) {
	await ctx.db.insert('emailFormatExternalDataLinks', args);
}

async function deleteEmailFormatExternalDataLinks(
	ctx: MutationCtx,
	workspaceId: Id<'workspaces'>,
	emailFormatId: Id<'emailFormats'>
) {
	const links = await ctx.db
		.query('emailFormatExternalDataLinks')
		.withIndex('by_workspace_emailFormat', (q) =>
			q.eq('workspaceId', workspaceId).eq('emailFormatId', emailFormatId)
		)
		.collect();

	for (const link of links) {
		await ctx.db.delete(link._id);
	}
}

export const createEmailFormatFromStarter = mutation({
	args: emailFormatCreateFromStarterInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { user, workspace } = viewerWorkspace;
		const formatDefinition = requireEmailFormatDefinition(args.formatDefinitionSlug);
		const variantSlug = args.variantSlug.trim();
		const formatSpec = getEmailFormatSpec(formatDefinition.slug, variantSlug);

		if (!formatSpec) {
			throw new Error('Email format variant not found.');
		}

		const createdFromStarterSlug = args.createdFromStarterSlug.trim();
		const variables = normalizeEmailFormatVariables(args.variables);
		const title = normalizeEmailFormatTitle(args.title);
		const content = normalizeEmailFormatContent(
			{
				to: args.to,
				cc: args.cc,
				attachment: args.attachment,
				body: args.body
			},
			variables
		);
		const now = Date.now();
		const linkedinContactsLink = getLinkedinContactsCreateLinkForEmailFormatSpec(
			formatSpec,
			args.externalDataImport
		);
		const rules = getInitialRulesForEmailFormatSpec(formatSpec);

		if (!createdFromStarterSlug) {
			throw new Error('Format starter slug is required.');
		}

		if (variables.length === 0) {
			throw new Error('Email format variables are required.');
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
			variantSlug: formatSpec.variantSlug,
			variables,
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
			rules,
			rulesVersion: 1,
			createdAt: now,
			updatedAt: now
		});

		if (linkedinContactsLink) {
			const externalDataSourceId = await createLinkedinContactsExternalDataSource(
				ctx,
				viewerWorkspace,
				linkedinContactsLink.source,
				now
			);

			await insertEmailFormatExternalDataLink(ctx, {
				workspaceId: workspace._id,
				emailFormatId,
				ruleId: linkedinContactsLink.ruleId,
				externalDataSourceId,
				createdAt: now
			});
		}

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
				const activationState = await getEmailFormatActivationState(
					ctx,
					workspace._id,
					format
				);

				return {
					id: format._id,
					title: format.title,
					status: format.status,
					createdAt: format.createdAt,
					activation: {
						canActivate: activationState.readiness.canActivate
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
		const formatSpec = requireEmailFormatSpecForFormat(format);
		const dataSourceLinkState = await getEmailFormatDataSourceLinkState(
			ctx,
			workspace._id,
			format._id
		);
		const { readiness: activationReadiness } = await getEmailFormatActivationState(
			ctx,
			workspace._id,
			format,
			{ dataSourceLinkState }
		);

		return {
			emailFormat: {
				id: format._id,
				formatDefinitionSlug: formatSpec.definitionSlug,
				variantSlug: formatSpec.variantSlug,
				createdFromStarterSlug: format.createdFromStarterSlug,
				dataMode: formatSpec.dataMode,
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
				activation: activationReadiness,
				updatedAt: format.updatedAt
			},
			formatDefinition: {
				slug: formatSpec.definitionSlug,
				dataMode: formatSpec.dataMode,
				variables: format.variables,
				contentEditPolicy: formatSpec.contentEditPolicy,
				rulesEditPolicy: formatSpec.rulesEditPolicy,
				dataSourceActions: getRuleDataSourceActions(formatSpec, dataSourceLinkState),
				ruleInfoCard: formatSpec.ruleInfoCard
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

export const addLinkedinContactsSourceToEmailFormatRule = mutation({
	args: addLinkedinContactsSourceToEmailFormatRuleInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { workspace } = viewerWorkspace;
		const format = await getEmailFormatInViewerWorkspace(
			ctx,
			viewerWorkspace,
			args.emailFormatId
		);

		if (!format) {
			throw new Error('Email format not found.');
		}

		const formatSpec = requireEmailFormatSpecForFormat(format);
		const requirement = getRequiredDataSourceRequirementForRule(formatSpec, args.ruleId);

		if (
			!requirement ||
			requirement.kind !== 'linkedinContacts' ||
			requirement.attachMode !== 'upload-new'
		) {
			throw new Error('This email format does not use LinkedIn contacts.');
		}

		if (!format.rules.some((rule) => rule.id === args.ruleId)) {
			throw new Error('Email format rule not found.');
		}

		const existingLinks = await collectEmailFormatExternalDataLinks(
			ctx,
			workspace._id,
			format._id
		);

		if (existingLinks.some((link) => link.ruleId === args.ruleId)) {
			throw new Error('This rule already has linked external data.');
		}

		const now = Date.now();
		const linkedinContactsSource = normalizeLinkedinContactsSource(args.externalDataImport);

		if (!linkedinContactsSource) {
			throw new Error('LinkedIn contacts are required.');
		}

		const externalDataSourceId = await createLinkedinContactsExternalDataSource(
			ctx,
			viewerWorkspace,
			linkedinContactsSource,
			now
		);

		await insertEmailFormatExternalDataLink(ctx, {
			workspaceId: workspace._id,
			emailFormatId: format._id,
			ruleId: args.ruleId,
			externalDataSourceId,
			createdAt: now
		});
		await ctx.db.patch(format._id, { updatedAt: now });

		return { externalDataSourceId };
	}
});

export const linkExternalDataSourceToEmailFormatRule = mutation({
	args: linkExternalDataSourceToEmailFormatRuleInput,
	handler: async (ctx, args) => {
		const viewerWorkspace = await requireViewerWorkspace(ctx);
		const { workspace } = viewerWorkspace;
		const format = await getEmailFormatInViewerWorkspace(
			ctx,
			viewerWorkspace,
			args.emailFormatId
		);

		if (!format) {
			throw new Error('Email format not found.');
		}

		const formatSpec = requireEmailFormatSpecForFormat(format);
		const requirement = getRequiredDataSourceRequirementForRule(formatSpec, args.ruleId);

		if (
			!requirement ||
			requirement.kind !== 'linkedinContacts' ||
			requirement.attachMode !== 'link-existing'
		) {
			throw new Error('This email format rule does not require LinkedIn contacts.');
		}

		if (!format.rules.some((rule) => rule.id === args.ruleId)) {
			throw new Error('Email format rule not found.');
		}

		const source = await ctx.db.get(args.externalDataSourceId);

		if (
			!source ||
			source.workspaceId !== workspace._id ||
			source.kind !== 'linkedinContacts' ||
			source.status !== 'ready'
		) {
			throw new Error('LinkedIn contacts source not found.');
		}

		const existingLinks = await collectEmailFormatExternalDataLinks(
			ctx,
			workspace._id,
			format._id
		);

		if (existingLinks.some((link) => link.ruleId === args.ruleId)) {
			throw new Error('This rule already has linked external data.');
		}

		const now = Date.now();

		await insertEmailFormatExternalDataLink(ctx, {
			workspaceId: workspace._id,
			emailFormatId: format._id,
			ruleId: args.ruleId,
			externalDataSourceId: source._id,
			createdAt: now
		});
		await ctx.db.patch(format._id, { updatedAt: now });

		return { externalDataSourceId: source._id };
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

		const formatSpec = requireEmailFormatSpecForFormat(format);

		if (!formatSpec.contentEditPolicy.title) {
			throw new Error('Title is fixed for this email format.');
		}

		if (format.titleVersion !== args.baseTitleVersion) {
			return versionedMutationResult('stale', 'title', format.title, format.titleVersion);
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

		return versionedMutationResult('saved', 'title', title, titleVersion);
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

		const formatSpec = requireEmailFormatSpecForFormat(format);

		if (format.emailContentVersion !== args.baseEmailContentVersion) {
			return versionedMutationResult(
				'stale',
				'emailContent',
				toEditableEmailFormatContent(format),
				format.emailContentVersion
			);
		}

		const content = normalizeEmailFormatContent(
			{
				to: args.to,
				cc: args.cc,
				attachment: args.attachment,
				body: args.body
			},
			format.variables
		);
		const currentContent = normalizeEmailFormatContent(
			{
				to: format.to,
				cc: format.cc,
				attachment: format.attachment,
				body: format.body
			},
			format.variables
		);

		assertLockedFieldUnchanged(
			formatSpec.contentEditPolicy.to,
			'Recipients',
			currentContent.to,
			content.to
		);
		assertLockedFieldUnchanged(
			formatSpec.contentEditPolicy.cc,
			'Cc recipients',
			currentContent.cc,
			content.cc
		);
		assertLockedFieldUnchanged(
			formatSpec.contentEditPolicy.attachment,
			'Attachment',
			currentContent.attachment,
			content.attachment
		);
		assertLockedFieldUnchanged(
			formatSpec.contentEditPolicy.body,
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

		return versionedMutationResult('saved', 'emailContent', content, emailContentVersion);
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

		const formatSpec = requireEmailFormatSpecForFormat(format);

		if (format.rulesVersion !== args.baseRulesVersion) {
			return versionedMutationResult('stale', 'rules', format.rules, format.rulesVersion);
		}

		const rules = normalizeEmailFormatRules(args.rules);
		const currentRules = normalizeEmailFormatRules(format.rules);

		if (
			!formatSpec.rulesEditPolicy.list &&
			!areRuleListsEqual(currentRules, rules)
		) {
			throw new Error('Rule list is fixed for this email format.');
		}

		if (
			!formatSpec.rulesEditPolicy.text &&
			!areRuleTextsEqual(currentRules, rules)
		) {
			throw new Error('Rule text is fixed for this email format.');
		}

		if (areJsonEqual(currentRules, rules)) {
			return versionedMutationResult('saved', 'rules', currentRules, format.rulesVersion);
		}

		const now = Date.now();
		const rulesVersion = format.rulesVersion + 1;

		await ctx.db.patch(args.emailFormatId, {
			rules,
			rulesVersion,
			updatedAt: now
		});

		return versionedMutationResult('saved', 'rules', rules, rulesVersion);
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
			const { readiness } = await getEmailFormatActivationState(
				ctx,
				viewerWorkspace.workspace._id,
				format
			);

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
			await deleteEmailFormatExternalDataLinks(ctx, viewerWorkspace.workspace._id, emailFormatId);
			await ctx.db.delete(emailFormatId);
		}
	}
});
