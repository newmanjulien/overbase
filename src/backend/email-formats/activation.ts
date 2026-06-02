import type { Doc, Id } from '../../convex/_generated/dataModel';
import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';
import {
	getEmailFormatActivationDataSourceRequirements,
	getEmailFormatCreationDataSourceRequirement,
	getEmailFormatDataSourceRequirementForRule,
	getEmailFormatSpec,
	type EmailFormatRule,
	type EmailFormatRuleDataSourceControl,
	type EmailFormatDataSourceRequirement,
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
			dataSourceRequirements: getEmailFormatActivationDataSourceRequirements(spec),
			externalData
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

export function isDataSourceRequirementLinked(
	requirement: EmailFormatDataSourceRequirement,
	externalData: EmailFormatActivationExternalDataState
) {
	switch (requirement.kind) {
		case 'linkedinContacts':
			return externalData.linkedinContactsRuleIds.includes(requirement.ruleId);
	}
}

export function getRuleDataSourceControls(
	spec: EmailFormatSpec,
	externalData: EmailFormatActivationExternalDataState
): EmailFormatRuleDataSourceControl[] {
	return spec.dataSourceRequirements.map((requirement) => {
		const linked = isDataSourceRequirementLinked(requirement, externalData);

		return {
			ruleId: requirement.ruleId,
			kind: requirement.kind,
			attachMode: requirement.attachMode,
			actionLabel: linked ? requirement.linkedLabel : requirement.actionLabel,
			disabled: linked
		};
	});
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
