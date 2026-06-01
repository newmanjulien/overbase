import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';
import {
	getEmailFormatLinkedinContactsRequirement,
	getEmailFormatSpec,
	type EmailFormatRule,
	type EmailFormatRuleDataSourceAction,
	type EmailFormatSpec
} from '../../shared/email-format-definitions';
import {
	getEmailFormatActivationReadiness,
	type EmailFormatActivationExternalDataState
} from '../../shared/email-format-activation';
import {
	normalizeLinkedinContactsSource,
	type LinkedinContactsImport,
	type NormalizedLinkedinContactsSource
} from '../external-data/linkedin-contacts';

type DbCtx = QueryCtx | MutationCtx;

type StoredEmailFormatIdentity = Pick<
	Doc<'emailFormats'>,
	'formatDefinitionSlug' | 'variantSlug'
>;

export type EmailFormatLinkedinContactsCreateLink = {
	ruleId: string;
	source: NormalizedLinkedinContactsSource;
};

export function requireEmailFormatSpecForFormat(
	format: StoredEmailFormatIdentity
) {
	const spec = getEmailFormatSpec(format.formatDefinitionSlug, format.variantSlug);

	if (!spec) {
		throw new Error('Email format variant not found.');
	}

	return spec;
}

export async function collectEmailFormatExternalDataLinks(
	ctx: DbCtx,
	workspaceId: Id<'workspaces'>,
	emailFormatId: Id<'emailFormats'>
) {
	return await ctx.db
		.query('emailFormatExternalDataLinks')
		.withIndex('by_workspace_emailFormat', (q) =>
			q.eq('workspaceId', workspaceId).eq('emailFormatId', emailFormatId)
		)
		.collect();
}

export async function getEmailFormatExternalDataState(
	ctx: DbCtx,
	workspaceId: Id<'workspaces'>,
	emailFormatId: Id<'emailFormats'>
): Promise<EmailFormatActivationExternalDataState> {
	const links = await collectEmailFormatExternalDataLinks(ctx, workspaceId, emailFormatId);
	const linkedinContactsRuleIds = new Set<string>();

	for (const link of links) {
		const source = await ctx.db.get(link.externalDataSourceId);

		if (
			source?.workspaceId === workspaceId &&
			source.kind === 'linkedinContacts' &&
			source.status === 'ready'
		) {
			linkedinContactsRuleIds.add(link.ruleId);
		}
	}

	return {
		linkedinContactsRuleIds: [...linkedinContactsRuleIds]
	};
}

export async function getEmailFormatActivationState(
	ctx: DbCtx,
	workspaceId: Id<'workspaces'>,
	format: Pick<
		Doc<'emailFormats'>,
		'_id' | 'formatDefinitionSlug' | 'recipientCount' | 'rules'
	> &
		StoredEmailFormatIdentity,
	options: {
		externalData?: EmailFormatActivationExternalDataState;
	} = {}
) {
	const spec = requireEmailFormatSpecForFormat(format);
	const externalData =
		options.externalData ?? (await getEmailFormatExternalDataState(ctx, workspaceId, format._id));

	return {
		spec,
		externalData,
		readiness: getEmailFormatActivationReadiness({
			recipientCount: format.recipientCount,
			rules: format.rules,
			requirements: spec.activationRequirements,
			externalData
		})
	};
}

export function getRuleDataSourceAction(
	spec: EmailFormatSpec,
	externalData: EmailFormatActivationExternalDataState
): EmailFormatRuleDataSourceAction {
	const linkedinContactsRequirement = getEmailFormatLinkedinContactsRequirement(spec);

	if (
		linkedinContactsRequirement &&
		externalData.linkedinContactsRuleIds.includes(linkedinContactsRequirement.ruleId)
	) {
		return { label: 'LinkedIn contacts added', disabled: true };
	}

	return spec.dataMode === 'public-data'
		? spec.ruleDataSourceAction
		: { label: 'Link data sources' };
}

export function getRequiredLinkedinContactsRuleId(spec: EmailFormatSpec) {
	return getEmailFormatLinkedinContactsRequirement(spec)?.ruleId ?? null;
}

export function getInitialRulesForEmailFormatSpec(spec: EmailFormatSpec): EmailFormatRule[] {
	return spec.dataMode === 'internal-data'
		? []
		: spec.initialRules.map((rule) => ({ ...rule }));
}

export function getLinkedinContactsCreateLinkForEmailFormatSpec(
	spec: EmailFormatSpec,
	externalDataImport: LinkedinContactsImport
): EmailFormatLinkedinContactsCreateLink | null {
	const linkedinContactsRuleId = getRequiredLinkedinContactsRuleId(spec);
	const linkedinContactsSource = externalDataImport
		? normalizeLinkedinContactsSource(externalDataImport)
		: null;

	if (externalDataImport && !linkedinContactsRuleId) {
		throw new Error('This email format does not accept LinkedIn contacts.');
	}

	if (linkedinContactsRuleId && !linkedinContactsSource) {
		throw new Error('LinkedIn contacts are required for this email format.');
	}

	if (!linkedinContactsSource) {
		return null;
	}

	if (!linkedinContactsRuleId) {
		throw new Error('LinkedIn contacts rule not found.');
	}

	if (!spec.initialRules.some((rule) => rule.id === linkedinContactsRuleId)) {
		throw new Error('LinkedIn contacts rule not found.');
	}

	return {
		ruleId: linkedinContactsRuleId,
		source: linkedinContactsSource
	};
}
