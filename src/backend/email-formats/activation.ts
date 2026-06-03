import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';
import {
	getEmailFormatSpec,
	type EmailFormatRule,
	type EmailFormatSpec
} from '../../domain/email-formats';
import { getEmailFormatRuleDataSourceActions } from '../../domain/email-formats/data-source-actions';
import {
	getEmailFormatActivationDataSourceRequirements,
	getEmailFormatCreationDataSourceRequirement,
	getEmailFormatDataSourceRequirementForRule
} from '../../domain/email-formats/data-source-requirements';
import type { EmailFormatDataSourceLinkState } from '../../domain/email-formats/data-source-link-state';
import { getEmailFormatActivationReadiness } from '../../domain/email-formats/activation';
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

export async function getEmailFormatDataSourceLinkState(
	ctx: DbCtx,
	workspaceId: Id<'workspaces'>,
	emailFormatId: Id<'emailFormats'>
): Promise<EmailFormatDataSourceLinkState> {
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
		dataSourceLinkState?: EmailFormatDataSourceLinkState;
	} = {}
) {
	const spec = requireEmailFormatSpecForFormat(format);
	const dataSourceLinkState =
		options.dataSourceLinkState ??
		(await getEmailFormatDataSourceLinkState(ctx, workspaceId, format._id));

	return {
		spec,
		dataSourceLinkState,
		readiness: getEmailFormatActivationReadiness({
			recipientCount: format.recipientCount,
			rules: format.rules,
			requirements: spec.activationRequirements,
			dataSourceRequirements: getEmailFormatActivationDataSourceRequirements(spec),
			dataSourceLinkState
		})
	};
}

export function getRequiredDataSourceRequirementForRule(
	spec: EmailFormatSpec,
	ruleId: string
) {
	return getEmailFormatDataSourceRequirementForRule(spec, ruleId);
}

export function getCreationDataSourceRequirement(spec: EmailFormatSpec) {
	return getEmailFormatCreationDataSourceRequirement(spec);
}

export function getRuleDataSourceActions(
	spec: EmailFormatSpec,
	dataSourceLinkState: EmailFormatDataSourceLinkState
) {
	return getEmailFormatRuleDataSourceActions(spec.dataSourceRequirements, dataSourceLinkState);
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
	const requirement = getCreationDataSourceRequirement(spec);
	const linkedinContactsSource = externalDataImport
		? normalizeLinkedinContactsSource(externalDataImport)
		: null;

	if (externalDataImport && (!requirement || requirement.kind !== 'linkedinContacts')) {
		throw new Error('This email format does not accept LinkedIn contacts.');
	}

	if (requirement?.kind === 'linkedinContacts' && !linkedinContactsSource) {
		throw new Error('LinkedIn contacts are required for this email format.');
	}

	if (!linkedinContactsSource) {
		return null;
	}

	if (!requirement) {
		throw new Error('LinkedIn contacts rule not found.');
	}

	if (requirement.attachMode !== 'upload-new') {
		throw new Error('This email format cannot upload new LinkedIn contacts here.');
	}

	if (!spec.initialRules.some((rule) => rule.id === requirement.ruleId)) {
		throw new Error('LinkedIn contacts rule not found.');
	}

	return {
		ruleId: requirement.ruleId,
		source: linkedinContactsSource
	};
}
