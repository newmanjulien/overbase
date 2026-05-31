import {
	builderParagraph as paragraph,
	builderText as text,
	builderVariable as variable
} from '$lib/features/builder/domain';
import {
	defineBuilder,
	seededSpreadsheetAttachment,
	spreadsheetCell as cell,
	spreadsheetVariable as sheetVariable
} from './helpers';

const variables = [
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
] as const;

export const implementationPlanBuilder = defineBuilder({
	mode: 'internal-data',
	slug: 'implementation-plan',
	title: 'Implementation plan',
	description: 'Start an implementation email with a seeded project plan attachment.',
	details: {
		paragraphs: [
			'Create a kickoff, migration, or remediation plan email for implementation work.',
			'The attached spreadsheet starts with dates, owners, dependencies, and success measures.'
		]
	},
	artwork: {
		id: 'implementation-plan-violet',
		iconId: 'clipboard-text',
		card: {
			tone: 'violet'
		},
		panel: {
			backColor: '#D8C7FF',
			frontColor: '#BFE9D2',
			iconCenterX: '57%',
			iconCenterY: '47%'
		}
	},
	startingPointSelection: {
		kind: 'guided',
		intro: 'Choose the implementation context so the plan starts from the right operating model.',
		questions: [
			{
				id: 'phase',
				title: 'Which phase is this for?',
				options: [
					{ id: 'kickoff', label: 'Kickoff' },
					{ id: 'migration', label: 'Migration' },
					{ id: 'stabilization', label: 'Stabilization' }
				]
			},
			{
				id: 'complexity',
				title: 'How complex is the work?',
				options: [
					{ id: 'simple', label: 'Simple rollout' },
					{ id: 'multi_team', label: 'Multi-team rollout' },
					{ id: 'high_risk', label: 'High-risk rollout' }
				]
			},
			{
				id: 'ownership',
				title: 'Who owns execution?',
				options: [
					{ id: 'client_led', label: 'Client-led' },
					{ id: 'joint', label: 'Joint team' },
					{ id: 'vendor_led', label: 'Vendor-led' }
				]
			}
		],
		rules: [
			{
				id: 'high-risk',
				startingPointId: 'risk-controlled-plan',
				answers: { complexity: 'high_risk' }
			},
			{
				id: 'stabilization',
				startingPointId: 'risk-controlled-plan',
				answers: { phase: 'stabilization' }
			},
			{ id: 'migration', startingPointId: 'migration-plan', answers: { phase: 'migration' } },
			{
				id: 'multi-team-joint',
				startingPointId: 'migration-plan',
				answers: { complexity: 'multi_team', ownership: 'joint' }
			},
			{ id: 'default', startingPointId: 'kickoff-plan', answers: {} }
		]
	},
	variables,
	startingPoints: [
		{
			id: 'kickoff-plan',
			label: 'Kickoff plan',
			emailContent: {
				title: 'Implementation kickoff plan',
				to: ['Implementation team'],
				cc: ['Client sponsor'],
				attachment: seededSpreadsheetAttachment('Implementation kickoff plan.xlsx', [
					[cell('Milestone'), cell('Owner'), cell('Date'), cell('Success metric')],
					[cell('Kickoff'), cell(sheetVariable('implementation_owner')), cell(sheetVariable('kickoff_date')), cell(sheetVariable('success_metric'))],
					[cell('Launch target'), cell(sheetVariable('workstream_owner')), cell(sheetVariable('target_launch_date')), cell('Readiness confirmed')]
				]),
				body: [
					paragraph('kickoff-greeting', [text('Hi '), variable('client_name'), text(',')]),
					paragraph('kickoff-summary', [
						text('Here is the kickoff plan for '),
						variable('program_name'),
						text('. We will start on '),
						variable('kickoff_date'),
						text(' and work toward '),
						variable('target_launch_date'),
						text('.')
					]),
					paragraph('kickoff-owner', [
						variable('implementation_owner'),
						text(' will own implementation, and we will measure success against '),
						variable('success_metric'),
						text('.')
					])
				]
			}
		},
		{
			id: 'migration-plan',
			label: 'Migration plan',
			emailContent: {
				title: 'Migration implementation plan',
				to: ['Implementation team'],
				cc: ['Technical owners'],
				attachment: seededSpreadsheetAttachment('Migration plan.xlsx', [
					[cell('Scope'), cell('Dependency'), cell('Owner'), cell('Target')],
					[cell(sheetVariable('migration_scope')), cell(sheetVariable('dependency')), cell(sheetVariable('integration_owner')), cell(sheetVariable('target_launch_date'))],
					[cell('Validation'), cell('Sample data review'), cell(sheetVariable('workstream_owner')), cell(sheetVariable('success_metric'))]
				]),
				body: [
					paragraph('migration-greeting', [text('Hi '), variable('client_name'), text(',')]),
					paragraph('migration-summary', [
						text('The migration scope for '),
						variable('program_name'),
						text(' is '),
						variable('migration_scope'),
						text('.')
					]),
					paragraph('migration-dependency', [
						text('The key dependency is '),
						variable('dependency'),
						text(', owned by '),
						variable('integration_owner'),
						text('.')
					])
				]
			}
		},
		{
			id: 'risk-controlled-plan',
			label: 'Risk-controlled plan',
			emailContent: {
				title: 'Implementation risk plan',
				to: ['Implementation leads'],
				cc: ['Client sponsor'],
				attachment: seededSpreadsheetAttachment('Implementation risk plan.xlsx', [
					[cell('Risk area'), cell('Mitigation'), cell('Owner'), cell('Review date')],
					[cell(sheetVariable('dependency')), cell(sheetVariable('risk_mitigation')), cell(sheetVariable('workstream_owner')), cell(sheetVariable('kickoff_date'))],
					[cell('Launch readiness'), cell(sheetVariable('success_metric')), cell(sheetVariable('implementation_owner')), cell(sheetVariable('target_launch_date'))]
				]),
				body: [
					paragraph('risk-plan-greeting', [text('Hi '), variable('client_name'), text(',')]),
					paragraph('risk-plan-summary', [
						text('For '),
						variable('program_name'),
						text(', we should use a controlled implementation plan because '),
						variable('dependency'),
						text(' needs close management.')
					]),
					paragraph('risk-plan-mitigation', [
						text('Mitigation: '),
						variable('risk_mitigation'),
						text('. Success will be measured by '),
						variable('success_metric'),
						text('.')
					])
				]
			}
		}
	],
	showInGallery: true,
	modeSortOrder: 30,
	status: 'active'
});
