export type EmailFormatDataMode = 'internal-data' | 'public-data';

export type EmailFormatVariableDefinition = {
	id: string;
	label: string;
};

export type EmailFormatContentEditPolicy = {
	title: boolean;
	to: boolean;
	cc: boolean;
	attachment: boolean;
	body: boolean;
};

export type EmailFormatRulesEditPolicy = {
	text: boolean;
	list: boolean;
	dataSources: boolean;
};

export type EmailFormatRule = {
	id: string;
	text: string;
};

export type EmailFormatRuleDataSourceAction = {
	label: string;
	disabled?: boolean;
};

export type EmailFormatExternalDataRequirement = {
	kind: 'linkedinContacts';
	ruleId: string;
};

export type EmailFormatActivationRequirement =
	| {
			kind: 'recipients';
	  }
	| {
			kind: 'rules';
	  }
	| {
			kind: 'externalData';
			externalData: EmailFormatExternalDataRequirement;
	  };

export type EmailFormatVariantInitialRecipients = 'viewer' | 'none';

export type EmailFormatVariant = {
	slug: string;
	label: string;
	initialRecipients: EmailFormatVariantInitialRecipients;
	activationRequirements: readonly EmailFormatActivationRequirement[];
	contentEditPolicy?: EmailFormatContentEditPolicy;
	rulesEditPolicy?: EmailFormatRulesEditPolicy;
	initialRules?: readonly EmailFormatRule[];
	ruleDataSourceAction?: EmailFormatRuleDataSourceAction;
	ruleDataSourceModal?: 'default' | 'reconnect-linkedin';
	ruleInfoCard?: {
		label: string;
		content: EmailFormatInlineTextContent;
	};
};

export type EmailFormatSpec = {
	definitionSlug: string;
	variantSlug: string;
	dataMode: EmailFormatDataMode;
	variables: readonly EmailFormatVariableDefinition[];
	contentEditPolicy: EmailFormatContentEditPolicy;
	rulesEditPolicy: EmailFormatRulesEditPolicy;
	initialRecipients: EmailFormatVariantInitialRecipients;
	activationRequirements: readonly EmailFormatActivationRequirement[];
	initialRules: readonly EmailFormatRule[];
	ruleDataSourceAction: EmailFormatRuleDataSourceAction;
	ruleDataSourceModal: 'default' | 'reconnect-linkedin';
	ruleInfoCard: {
		label: string;
		content: EmailFormatInlineTextContent;
	} | null;
};

export type EmailFormatInlineTextContent = string | readonly EmailFormatInlineTextPart[];

export type EmailFormatInlineTextPart =
	| {
			kind: 'text';
			text: string;
	  }
	| {
			kind: 'link';
			label: string;
			href: `/${string}`;
	  };

type EmailFormatDefinitionBase = {
	slug: string;
	dataMode: EmailFormatDataMode;
	variables: readonly EmailFormatVariableDefinition[];
	contentEditPolicy: EmailFormatContentEditPolicy;
	rulesEditPolicy: EmailFormatRulesEditPolicy;
	variants: readonly EmailFormatVariant[];
	ruleInfoCard?: {
		label: string;
		content: EmailFormatInlineTextContent;
	};
};

export type InternalDataEmailFormatDefinition = EmailFormatDefinitionBase & {
	dataMode: 'internal-data';
};

export type PublicDataEmailFormatDefinition = EmailFormatDefinitionBase & {
	dataMode: 'public-data';
	ruleInfoCard: NonNullable<EmailFormatDefinitionBase['ruleInfoCard']>;
};

export type EmailFormatDefinition =
	| InternalDataEmailFormatDefinition
	| PublicDataEmailFormatDefinition;

const INTERNAL_DATA_CONTENT_EDIT_POLICY = {
	title: true,
	to: true,
	cc: true,
	attachment: true,
	body: true
} as const satisfies EmailFormatContentEditPolicy;

const PUBLIC_DATA_CONTENT_EDIT_POLICY = {
	title: false,
	to: false,
	cc: false,
	attachment: false,
	body: false
} as const satisfies EmailFormatContentEditPolicy;

const INTERNAL_DATA_RULES_EDIT_POLICY = {
	text: true,
	list: true,
	dataSources: true
} as const satisfies EmailFormatRulesEditPolicy;

const PUBLIC_DATA_RULES_EDIT_POLICY = {
	text: false,
	list: false,
	dataSources: true
} as const satisfies EmailFormatRulesEditPolicy;

const INTERNAL_DATA_RULE_INFO_CARD = {
	label: 'Next steps:',
	content:
		'Make these rules as precise and detailed as possible, you can also train the AI by giving feedback on specific sent emails'
} as const satisfies NonNullable<EmailFormatDefinitionBase['ruleInfoCard']>;

const DEFAULT_ACTIVATION_REQUIREMENTS = [
	{ kind: 'recipients' },
	{ kind: 'rules' }
] as const satisfies readonly EmailFormatActivationRequirement[];

const LINKEDIN_CONTACTS_RULE_ID = 'only-rule';

export const reconnectLinkedinFormatVariables = [
	{ id: 'assistant', label: 'Assistant' },
	{ id: 'senior_leader', label: 'Senior leader' },
	{ id: 'team_member', label: 'Team member' },
	{ id: 'email', label: 'Email' },
	{ id: 'linkedin_url', label: 'LinkedIn URL' },
	{ id: 'link', label: 'Link' },
	{ id: 'yesno', label: 'Yes/No' }
] as const satisfies readonly EmailFormatVariableDefinition[];

export const clientUpdateFormatVariables = [
	{ id: 'client_name', label: 'Client name' },
	{ id: 'client_company', label: 'Client company' },
	{ id: 'sponsor_name', label: 'Sponsor name' },
	{ id: 'account_owner', label: 'Account owner' },
	{ id: 'customer_success_manager', label: 'Customer success manager' },
	{ id: 'project_name', label: 'Project name' },
	{ id: 'workstream_name', label: 'Workstream name' },
	{ id: 'milestone_name', label: 'Milestone name' },
	{ id: 'reporting_period', label: 'Reporting period' },
	{ id: 'current_status', label: 'Current status' },
	{ id: 'timeline_status', label: 'Timeline status' },
	{ id: 'budget_status', label: 'Budget status' },
	{ id: 'completed_work', label: 'Completed work' },
	{ id: 'upcoming_work', label: 'Upcoming work' },
	{ id: 'priority_update', label: 'Priority update' },
	{ id: 'decision_needed', label: 'Decision needed' },
	{ id: 'decision_due_date', label: 'Decision due date' },
	{ id: 'requested_feedback', label: 'Requested feedback' },
	{ id: 'risk_summary', label: 'Risk summary' },
	{ id: 'risk_owner', label: 'Risk owner' },
	{ id: 'blocker', label: 'Blocker' },
	{ id: 'blocker_owner', label: 'Blocker owner' },
	{ id: 'blocker_due_date', label: 'Blocker due date' },
	{ id: 'escalation_path', label: 'Escalation path' },
	{ id: 'next_meeting_date', label: 'Next meeting date' },
	{ id: 'action_owner', label: 'Action owner' },
	{ id: 'action_due_date', label: 'Action due date' }
] as const satisfies readonly EmailFormatVariableDefinition[];

export const dealFollowUpFormatVariables = [
	{ id: 'prospect_company', label: 'Prospect company' },
	{ id: 'primary_contact_email', label: 'Primary contact email' },
	{ id: 'buyer_name', label: 'Buyer name' },
	{ id: 'champion_name', label: 'Champion name' },
	{ id: 'economic_buyer', label: 'Economic buyer' },
	{ id: 'deal_owner', label: 'Deal owner' },
	{ id: 'procurement_owner', label: 'Procurement owner' },
	{ id: 'legal_owner', label: 'Legal owner' },
	{ id: 'security_owner', label: 'Security owner' },
	{ id: 'opportunity_name', label: 'Opportunity name' },
	{ id: 'deal_stage', label: 'Deal stage' },
	{ id: 'business_goal', label: 'Business goal' },
	{ id: 'pain_point', label: 'Pain point' },
	{ id: 'use_case', label: 'Use case' },
	{ id: 'success_criteria', label: 'Success criteria' },
	{ id: 'competitor', label: 'Competitor' },
	{ id: 'decision_criteria', label: 'Decision criteria' },
	{ id: 'mutual_action_plan', label: 'Mutual action plan' },
	{ id: 'meeting_date', label: 'Meeting date' },
	{ id: 'close_date', label: 'Close date' },
	{ id: 'renewal_date', label: 'Renewal date' },
	{ id: 'proposal_link', label: 'Proposal link' },
	{ id: 'contract_value', label: 'Contract value' },
	{ id: 'budget_owner', label: 'Budget owner' },
	{ id: 'next_step', label: 'Next step' },
	{ id: 'next_step_date', label: 'Next step date' },
	{ id: 'commercial_question', label: 'Commercial question' }
] as const satisfies readonly EmailFormatVariableDefinition[];

export const implementationPlanFormatVariables = [
	{ id: 'client_name', label: 'Client name' },
	{ id: 'program_name', label: 'Program name' },
	{ id: 'environment_name', label: 'Environment name' },
	{ id: 'implementation_owner', label: 'Implementation owner' },
	{ id: 'executive_sponsor', label: 'Executive sponsor' },
	{ id: 'technical_owner', label: 'Technical owner' },
	{ id: 'project_manager', label: 'Project manager' },
	{ id: 'integration_owner', label: 'Integration owner' },
	{ id: 'system_owner', label: 'System owner' },
	{ id: 'support_contact', label: 'Support contact' },
	{ id: 'target_launch_date', label: 'Target launch date' },
	{ id: 'kickoff_date', label: 'Kickoff date' },
	{ id: 'go_live_date', label: 'Go-live date' },
	{ id: 'training_date', label: 'Training date' },
	{ id: 'cutover_window', label: 'Cutover window' },
	{ id: 'migration_scope', label: 'Migration scope' },
	{ id: 'data_source', label: 'Data source' },
	{ id: 'integration_name', label: 'Integration name' },
	{ id: 'dependency', label: 'Dependency' },
	{ id: 'risk_mitigation', label: 'Risk mitigation' },
	{ id: 'rollback_plan', label: 'Rollback plan' },
	{ id: 'launch_risk', label: 'Launch risk' },
	{ id: 'workstream_owner', label: 'Workstream owner' },
	{ id: 'success_metric', label: 'Success metric' },
	{ id: 'acceptance_criteria', label: 'Acceptance criteria' },
	{ id: 'readiness_status', label: 'Readiness status' },
	{ id: 'post_launch_check', label: 'Post-launch check' }
] as const satisfies readonly EmailFormatVariableDefinition[];

export const emailFormatDefinitionEntries = [
	{
		slug: 'reconnect-linkedin',
		dataMode: 'public-data',
		variables: reconnectLinkedinFormatVariables,
		contentEditPolicy: PUBLIC_DATA_CONTENT_EDIT_POLICY,
		rulesEditPolicy: PUBLIC_DATA_RULES_EDIT_POLICY,
		ruleInfoCard: {
			label: 'Tip:',
			content: [
				{
					kind: 'text',
					text: 'Everything is preset because this format only uses public data. Formats that '
				},
				{
					kind: 'link',
					label: 'use internal data',
					href: '/create-formats?mode=internal-data'
				},
				{
					kind: 'text',
					text: ' let you customize'
				}
			]
		},
		variants: [
			{
				slug: 'personal',
				label: 'Reconnect with contacts',
				initialRecipients: 'viewer',
				activationRequirements: [
					...DEFAULT_ACTIVATION_REQUIREMENTS,
					{
						kind: 'externalData',
						externalData: {
							kind: 'linkedinContacts',
							ruleId: LINKEDIN_CONTACTS_RULE_ID
						}
					}
				],
				initialRules: [
					{
						id: LINKEDIN_CONTACTS_RULE_ID,
						text: 'Ask team members about their relationship with each person in their LinkedIn contacts. When you find someone worth reconnecting with, look for news or content that would make it easy'
					}
				],
				ruleDataSourceAction: { label: 'Add LinkedIn contacts' },
				ruleDataSourceModal: 'reconnect-linkedin'
			},
			{
				slug: 'team',
				label: 'Reconnect with contacts for team members',
				initialRecipients: 'none',
				activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS,
				initialRules: [
					{
						id: LINKEDIN_CONTACTS_RULE_ID,
						text: 'Ask team members about their relationship with each person in their LinkedIn contacts. When you find someone worth reconnecting with, look for news or content that would make it easy'
					}
				],
				ruleDataSourceAction: { label: 'No data needed', disabled: true }
			},
			{
				slug: 'senior-leadership',
				label: 'Reconnect with contacts for senior leadership',
				initialRecipients: 'none',
				activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS,
				initialRules: [
					{
						id: LINKEDIN_CONTACTS_RULE_ID,
						text: 'Ask team members about their relationship with each person in their LinkedIn contacts. When you find someone worth reconnecting with, look for news or content that would make it easy'
					}
				],
				ruleDataSourceAction: { label: 'No data needed', disabled: true }
			}
		]
	},
	{
		slug: 'client-update',
		dataMode: 'internal-data',
		variables: clientUpdateFormatVariables,
		contentEditPolicy: INTERNAL_DATA_CONTENT_EDIT_POLICY,
		rulesEditPolicy: INTERNAL_DATA_RULES_EDIT_POLICY,
		ruleInfoCard: INTERNAL_DATA_RULE_INFO_CARD,
		variants: [
			{
				slug: 'default',
				label: 'Client update',
				initialRecipients: 'none',
				activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS
			}
		]
	},
	{
		slug: 'deal-follow-up',
		dataMode: 'internal-data',
		variables: dealFollowUpFormatVariables,
		contentEditPolicy: INTERNAL_DATA_CONTENT_EDIT_POLICY,
		rulesEditPolicy: INTERNAL_DATA_RULES_EDIT_POLICY,
		ruleInfoCard: INTERNAL_DATA_RULE_INFO_CARD,
		variants: [
			{
				slug: 'default',
				label: 'Deal follow-up',
				initialRecipients: 'none',
				activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS
			}
		]
	},
	{
		slug: 'implementation-plan',
		dataMode: 'internal-data',
		variables: implementationPlanFormatVariables,
		contentEditPolicy: INTERNAL_DATA_CONTENT_EDIT_POLICY,
		rulesEditPolicy: INTERNAL_DATA_RULES_EDIT_POLICY,
		ruleInfoCard: INTERNAL_DATA_RULE_INFO_CARD,
		variants: [
			{
				slug: 'default',
				label: 'Implementation plan',
				initialRecipients: 'none',
				activationRequirements: DEFAULT_ACTIVATION_REQUIREMENTS
			}
		]
	}
] as const satisfies readonly EmailFormatDefinition[];

export type EmailFormatDefinitionValidationIssue = {
	definitionSlug?: string;
	variantSlug?: string;
	message: string;
};

export function validateEmailFormatDefinitions(
	definitions: readonly EmailFormatDefinition[]
): EmailFormatDefinitionValidationIssue[] {
	const issues: EmailFormatDefinitionValidationIssue[] = [];
	const definitionSlugs = new Set<string>();

	for (const definition of definitions) {
		if (!definition.slug.trim()) {
			issues.push({ message: 'Email format definitions cannot use an empty slug.' });
		}

		if (definitionSlugs.has(definition.slug)) {
			issues.push({
				definitionSlug: definition.slug,
				message: `Duplicate email format definition slug "${definition.slug}".`
			});
		}

		definitionSlugs.add(definition.slug);

		if (definition.variants.length === 0) {
			issues.push({
				definitionSlug: definition.slug,
				message: 'Email format definitions must define at least one variant.'
			});
		}

		if (
			definition.dataMode === 'public-data' &&
			(!definition.ruleInfoCard.label.trim() ||
				!hasEmailFormatInlineTextContent(definition.ruleInfoCard.content))
		) {
			issues.push({
				definitionSlug: definition.slug,
				message: 'Public-data email format definitions must define rule info-card copy.'
			});
		}

		validateEmailFormatDefinitionVariants(issues, definition);
	}

	return issues;
}

function validateEmailFormatDefinitionVariants(
	issues: EmailFormatDefinitionValidationIssue[],
	definition: EmailFormatDefinition
) {
	const variantSlugs = new Set<string>();

	for (const variant of definition.variants) {
		if (!variant.slug.trim()) {
			issues.push({
				definitionSlug: definition.slug,
				message: 'Email format variants cannot use an empty slug.'
			});
		}

		if (variantSlugs.has(variant.slug)) {
			issues.push({
				definitionSlug: definition.slug,
				variantSlug: variant.slug,
				message: `Duplicate email format variant slug "${variant.slug}".`
			});
		}

		variantSlugs.add(variant.slug);

		if (!variant.label.trim()) {
			issues.push({
				definitionSlug: definition.slug,
				variantSlug: variant.slug,
				message: 'Email format variants must define a label.'
			});
		}

		if (variant.activationRequirements.length === 0) {
			issues.push({
				definitionSlug: definition.slug,
				variantSlug: variant.slug,
				message: 'Email format variants must define at least one activation requirement.'
			});
		}

		validateEmailFormatVariantRules(issues, definition, variant);
		validateEmailFormatVariantActivationRequirements(issues, definition, variant);
		validateEmailFormatVariantDataSourceAction(issues, definition, variant);
	}
}

function validateEmailFormatVariantRules(
	issues: EmailFormatDefinitionValidationIssue[],
	definition: EmailFormatDefinition,
	variant: EmailFormatVariant
) {
	const rules = variant.initialRules ?? [];
	const ruleIds = new Set<string>();

	for (const rule of rules) {
		if (ruleIds.has(rule.id)) {
			issues.push({
				definitionSlug: definition.slug,
				variantSlug: variant.slug,
				message: `Duplicate initial email-format rule id "${rule.id}".`
			});
		}

		ruleIds.add(rule.id);

		if (!rule.id.trim()) {
			issues.push({
				definitionSlug: definition.slug,
				variantSlug: variant.slug,
				message: 'Initial email-format rules cannot use an empty id.'
			});
		}

		if (!rule.text.trim()) {
			issues.push({
				definitionSlug: definition.slug,
				variantSlug: variant.slug,
				message: `Initial email-format rule "${rule.id}" must include text.`
			});
		}
	}

	if (
		definition.dataMode === 'public-data' &&
		hasActivationRequirement(variant, 'rules') &&
		rules.length === 0
	) {
		issues.push({
			definitionSlug: definition.slug,
			variantSlug: variant.slug,
			message:
				'Public-data email format variants with rule activation must define at least one initial rule.'
		});
	}
}

function validateEmailFormatVariantActivationRequirements(
	issues: EmailFormatDefinitionValidationIssue[],
	definition: EmailFormatDefinition,
	variant: EmailFormatVariant
) {
	const initialRuleIds = new Set((variant.initialRules ?? []).map((rule) => rule.id));

	for (const requirement of variant.activationRequirements) {
		const requirementKind = (requirement as { kind: string }).kind;

		if (
			requirementKind !== 'recipients' &&
			requirementKind !== 'rules' &&
			requirementKind !== 'externalData'
		) {
			issues.push({
				definitionSlug: definition.slug,
				variantSlug: variant.slug,
				message: `Email format variant uses unknown activation requirement "${String(
					requirementKind
				)}".`
			});
			continue;
		}

		if (requirement.kind !== 'externalData') {
			continue;
		}

		const externalDataKind = (requirement.externalData as { kind: string }).kind;

		if (externalDataKind !== 'linkedinContacts') {
			issues.push({
				definitionSlug: definition.slug,
				variantSlug: variant.slug,
				message: `Email format variant uses unknown external data requirement "${String(
					externalDataKind
				)}".`
			});
			continue;
		}

		if (!requirement.externalData.ruleId.trim()) {
			issues.push({
				definitionSlug: definition.slug,
				variantSlug: variant.slug,
				message: 'LinkedIn contacts requirements must reference a rule id.'
			});
			continue;
		}

		if (!initialRuleIds.has(requirement.externalData.ruleId)) {
			issues.push({
				definitionSlug: definition.slug,
				variantSlug: variant.slug,
				message: `LinkedIn contacts requirement references missing initial rule "${requirement.externalData.ruleId}".`
			});
		}
	}
}

function validateEmailFormatVariantDataSourceAction(
	issues: EmailFormatDefinitionValidationIssue[],
	definition: EmailFormatDefinition,
	variant: EmailFormatVariant
) {
	if (
		variant.ruleDataSourceAction &&
		!variant.ruleDataSourceAction.label.trim()
	) {
		issues.push({
			definitionSlug: definition.slug,
			variantSlug: variant.slug,
			message: 'Rule data-source actions must define a label.'
		});
	}

	if (
		variant.ruleDataSourceModal &&
		variant.ruleDataSourceModal !== 'default' &&
		variant.ruleDataSourceModal !== 'reconnect-linkedin'
	) {
		issues.push({
			definitionSlug: definition.slug,
			variantSlug: variant.slug,
			message: `Email format variant uses unknown rule data-source modal "${String(
				variant.ruleDataSourceModal
			)}".`
		});
	}

	const requiresLinkedinContacts = variant.activationRequirements.some(
		(requirement) =>
			requirement.kind === 'externalData' &&
			requirement.externalData.kind === 'linkedinContacts'
	);

	if (requiresLinkedinContacts && variant.ruleDataSourceModal !== 'reconnect-linkedin') {
		issues.push({
			definitionSlug: definition.slug,
			variantSlug: variant.slug,
			message:
				'Variants with LinkedIn contacts requirements must use the LinkedIn contacts data-source modal.'
		});
	}

	if (variant.ruleDataSourceModal === 'reconnect-linkedin' && !requiresLinkedinContacts) {
		issues.push({
			definitionSlug: definition.slug,
			variantSlug: variant.slug,
			message:
				'The LinkedIn contacts data-source modal requires a LinkedIn contacts activation requirement.'
		});
	}
}

function hasActivationRequirement(
	variant: EmailFormatVariant,
	kind: EmailFormatActivationRequirement['kind']
) {
	return variant.activationRequirements.some((requirement) => requirement.kind === kind);
}

function hasEmailFormatInlineTextContent(content: EmailFormatInlineTextContent) {
	if (typeof content === 'string') {
		return Boolean(content.trim());
	}

	return content.some((part) => {
		if (part.kind === 'text') {
			return Boolean(part.text.trim());
		}

		return Boolean(part.label.trim());
	});
}

const emailFormatDefinitionValidationIssues =
	validateEmailFormatDefinitions(emailFormatDefinitionEntries);

if (emailFormatDefinitionValidationIssues.length > 0) {
	throw new Error(
		`Invalid email format definitions:\n${emailFormatDefinitionValidationIssues
			.map(
				(issue) =>
					`- ${[
						issue.definitionSlug,
						issue.variantSlug
					]
						.filter(Boolean)
						.join('/')}${issue.definitionSlug ? ': ' : ''}${issue.message}`
			)
			.join('\n')}`
	);
}

export function listEmailFormatDefinitions() {
	return [...emailFormatDefinitionEntries];
}

export function getEmailFormatDefinition(slug: string) {
	return emailFormatDefinitionEntries.find((definition) => definition.slug === slug) ?? null;
}

export function getDefaultEmailFormatVariant(definition: EmailFormatDefinition) {
	return definition.variants[0] ?? null;
}

export function getEmailFormatVariant(
	definition: EmailFormatDefinition,
	variantSlug: string
) {
	return definition.variants.find((variant) => variant.slug === variantSlug) ?? null;
}

export function getEmailFormatSpec(
	definitionSlug: string,
	variantSlug: string
): EmailFormatSpec | null {
	const definition = getEmailFormatDefinition(definitionSlug);

	if (!definition) {
		return null;
	}

	const variant = getEmailFormatVariant(definition, variantSlug);

	if (!variant) {
		return null;
	}

	return {
		definitionSlug: definition.slug,
		variantSlug: variant.slug,
		dataMode: definition.dataMode,
		variables: definition.variables,
		contentEditPolicy: variant.contentEditPolicy ?? definition.contentEditPolicy,
		rulesEditPolicy: variant.rulesEditPolicy ?? definition.rulesEditPolicy,
		initialRecipients: variant.initialRecipients,
		activationRequirements: variant.activationRequirements,
		initialRules: variant.initialRules ?? [],
		ruleDataSourceAction:
			variant.ruleDataSourceAction ?? { label: 'Link data sources' },
		ruleDataSourceModal: variant.ruleDataSourceModal ?? 'default',
		ruleInfoCard: variant.ruleInfoCard ?? definition.ruleInfoCard ?? null
	};
}

export function getEmailFormatLinkedinContactsRequirement(
	spec: Pick<EmailFormatSpec, 'activationRequirements'>
) {
	for (const requirement of spec.activationRequirements) {
		if (
			requirement.kind === 'externalData' &&
			requirement.externalData.kind === 'linkedinContacts'
		) {
			return requirement.externalData;
		}
	}

	return null;
}
