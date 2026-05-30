import type { BlueprintRegistryEntry } from '../registry';
import {
	blueprintBulletItem as bulletItem,
	blueprintBullets as bullets,
	blueprintParagraph as paragraph,
	blueprintText as text,
	blueprintVariable as variable
} from '../model';
import { BLUEPRINT_SETUP_SKIPPED_ANSWER } from '../setup';
import { seededSpreadsheetAttachment, spreadsheetCell as cell, spreadsheetVariable as sheetVariable } from './helpers';

const variables = [
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
] as const;

export const clientUpdateBlueprint = {
	slug: 'client-update',
	title: 'Client update',
	description: 'Draft a client-facing update with the right level of detail and a seeded tracker.',
	details: {
		paragraphs: [
			'Create a concise client update for status, decisions, or risk follow-up.',
			'The generated draft includes a spreadsheet attachment that can be edited before publishing.'
		]
	},
	artwork: {
		id: 'client-update-aqua',
		card: {
			tone: 'aqua',
			iconId: 'message-square-quote',
			symbolSize: 'md'
		},
		panel: {
			backColor: '#DDFB93',
			frontColor: '#9DE5F3',
			iconId: 'message-square-quote',
			iconCenterX: '60%',
			iconCenterY: '46%'
		}
	},
	setup: {
		intro: 'Answer a few questions so the starter email matches the update you need to send.',
		questions: [
			{
				id: 'update_focus',
				title: 'What is the update focused on?',
				helpText: 'Choose the main job this email needs to do.',
				options: [
					{ id: 'status', label: 'Project status' },
					{ id: 'decision', label: 'Decision needed' },
					{ id: 'risk', label: 'Risk or blocker' }
				]
			},
			{
				id: 'audience',
				title: 'Who is the primary audience?',
				helpText: 'This affects how direct and detailed the draft should be.',
				options: [
					{ id: 'executive', label: 'Executive sponsor' },
					{ id: 'working_team', label: 'Working team' },
					{ id: 'client_lead', label: 'Client lead' }
				]
			},
			{
				id: 'detail_level',
				title: 'How much detail should the email include?',
				options: [
					{ id: 'summary', label: 'Short summary' },
					{ id: 'detailed', label: 'Detailed context' },
					{ id: 'actions', label: 'Action-focused' }
				]
			}
		]
	},
	variables,
	contentTemplates: [
		{
			id: 'steady-progress',
			label: 'Steady progress update',
			emailContent: {
				title: 'Client update',
				to: ['Client team'],
				cc: ['Project team'],
				attachment: seededSpreadsheetAttachment('Client update tracker.xlsx', [
					[cell('Workstream'), cell('Status'), cell('Owner'), cell('Next checkpoint')],
					[cell('Program summary'), cell(sheetVariable('current_status')), cell(sheetVariable('account_owner')), cell(sheetVariable('next_meeting_date'))],
					[cell('Priority item'), cell(sheetVariable('priority_update')), cell('Overbase'), cell('This week')]
				]),
				body: [
					paragraph('steady-greeting', [text('Hi '), variable('client_name'), text(',')]),
					paragraph('steady-summary', [
						text('Here is the update for '),
						variable('project_name'),
						text(' covering '),
						variable('reporting_period'),
						text('. The current status is '),
						variable('current_status'),
						text('.')
					]),
					bullets('steady-highlights', [
						bulletItem('steady-priority', [text('Priority update: '), variable('priority_update')]),
						bulletItem('steady-next', [
							text('Next checkpoint: '),
							variable('next_meeting_date')
						])
					])
				]
			}
		},
		{
			id: 'decision-request',
			label: 'Decision request',
			emailContent: {
				title: 'Decision needed',
				to: ['Client lead'],
				cc: ['Project team'],
				attachment: seededSpreadsheetAttachment('Decision tracker.xlsx', [
					[cell('Decision'), cell('Owner'), cell('Due date'), cell('Impact')],
					[cell(sheetVariable('decision_needed')), cell('Client team'), cell(sheetVariable('decision_due_date')), cell('Keeps the plan moving')],
					[cell('Supporting context'), cell(sheetVariable('account_owner')), cell('Prepared'), cell(sheetVariable('priority_update'))]
				]),
				body: [
					paragraph('decision-greeting', [text('Hi '), variable('client_name'), text(',')]),
					paragraph('decision-summary', [
						text('We need your direction on '),
						variable('decision_needed'),
						text(' for '),
						variable('project_name'),
						text('.')
					]),
					paragraph('decision-timing', [
						text('A decision by '),
						variable('decision_due_date'),
						text(' will let '),
						variable('account_owner'),
						text(' keep the next step on track.')
					])
				]
			}
		},
		{
			id: 'risk-escalation',
			label: 'Risk escalation',
			emailContent: {
				title: 'Risk update',
				to: ['Client sponsor'],
				cc: ['Project team'],
				attachment: seededSpreadsheetAttachment('Risk register.xlsx', [
					[cell('Risk'), cell('Owner'), cell('Status'), cell('Mitigation')],
					[cell(sheetVariable('risk_summary')), cell(sheetVariable('risk_owner')), cell(sheetVariable('current_status')), cell('Review and unblock')],
					[cell('Next review'), cell(sheetVariable('account_owner')), cell(sheetVariable('next_meeting_date')), cell(sheetVariable('priority_update'))]
				]),
				body: [
					paragraph('risk-greeting', [text('Hi '), variable('client_name'), text(',')]),
					paragraph('risk-summary', [
						text('Flagging one risk for '),
						variable('project_name'),
						text(': '),
						variable('risk_summary'),
						text('.')
					]),
					paragraph('risk-owner', [
						text('The current owner is '),
						variable('risk_owner'),
						text(', and we should review this before '),
						variable('next_meeting_date'),
						text('.')
					])
				]
			}
		}
	],
	resolutionRules: [
		{ id: 'risk-focus', templateId: 'risk-escalation', answers: { update_focus: 'risk' } },
		{ id: 'decision-focus', templateId: 'decision-request', answers: { update_focus: 'decision' } },
		{ id: 'executive-summary', templateId: 'steady-progress', answers: { audience: 'executive', detail_level: 'summary' } },
		{ id: 'status-detailed', templateId: 'steady-progress', answers: { update_focus: 'status', detail_level: 'detailed' } },
		{ id: 'skipped-focus', templateId: 'steady-progress', answers: { update_focus: BLUEPRINT_SETUP_SKIPPED_ANSWER } },
		{ id: 'skipped-audience', templateId: 'steady-progress', answers: { audience: BLUEPRINT_SETUP_SKIPPED_ANSWER } },
		{ id: 'skipped-detail', templateId: 'steady-progress', answers: { detail_level: BLUEPRINT_SETUP_SKIPPED_ANSWER } },
		{ id: 'default', templateId: 'steady-progress', answers: {} }
	],
	showInGallery: true,
	sortOrder: 10,
	status: 'active'
} satisfies BlueprintRegistryEntry;
