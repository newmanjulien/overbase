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
	initialRules: readonly EmailFormatRule[];
	ruleDataSourceAction: EmailFormatRuleDataSourceAction;
	ruleDataSourceModal?: 'default' | 'reconnect-linkedin';
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
		ruleDataSourceAction: { label: 'Add LinkedIn contacts' },
		ruleDataSourceModal: 'reconnect-linkedin',
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
		initialRules: [
			{
				id: 'only-rule',
				text: 'Ask team members about their relationship with each person in their LinkedIn contacts. When you find someone worth reconnecting with, look for news or content that would make it easy'
			}
		]
	},
	{
		slug: 'client-update',
		dataMode: 'internal-data',
		variables: clientUpdateFormatVariables,
		contentEditPolicy: INTERNAL_DATA_CONTENT_EDIT_POLICY,
		rulesEditPolicy: INTERNAL_DATA_RULES_EDIT_POLICY,
		ruleInfoCard: INTERNAL_DATA_RULE_INFO_CARD
	},
	{
		slug: 'deal-follow-up',
		dataMode: 'internal-data',
		variables: dealFollowUpFormatVariables,
		contentEditPolicy: INTERNAL_DATA_CONTENT_EDIT_POLICY,
		rulesEditPolicy: INTERNAL_DATA_RULES_EDIT_POLICY,
		ruleInfoCard: INTERNAL_DATA_RULE_INFO_CARD
	},
	{
		slug: 'implementation-plan',
		dataMode: 'internal-data',
		variables: implementationPlanFormatVariables,
		contentEditPolicy: INTERNAL_DATA_CONTENT_EDIT_POLICY,
		rulesEditPolicy: INTERNAL_DATA_RULES_EDIT_POLICY,
		ruleInfoCard: INTERNAL_DATA_RULE_INFO_CARD
	}
] as const satisfies readonly EmailFormatDefinition[];

export function listEmailFormatDefinitions() {
	return [...emailFormatDefinitionEntries];
}

export function getEmailFormatDefinition(slug: string) {
	return emailFormatDefinitionEntries.find((definition) => definition.slug === slug) ?? null;
}
