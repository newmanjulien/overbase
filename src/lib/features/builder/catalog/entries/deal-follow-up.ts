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
] as const;

export const dealFollowUpBuilder = defineBuilder({
	mode: 'internal-data',
	slug: 'deal-follow-up',
	title: 'Deal follow-up',
	description: 'Follow up after a sales conversation with the right ask and attached deal tracker.',
	details: {
		paragraphs: [
			'Create a useful follow-up after discovery, proposal review, or procurement discussion.',
			'The attachment captures next steps, open questions, and ownership.'
		]
	},
	artwork: {
		id: 'deal-follow-up-coral',
		iconId: 'handshake',
		card: {
			tone: 'coral'
		},
		panel: {
			backColor: '#FFD0C2',
			frontColor: '#F8E27B',
			iconCenterX: '58%',
			iconCenterY: '48%'
		}
	},
	startingPointSelection: {
		kind: 'guided',
		intro: 'Shape the follow-up around the buying stage, recipient, and request.',
		questions: [
			{
				id: 'deal_stage',
				title: 'Where is the deal?',
				options: [
					{ id: 'discovery', label: 'Discovery' },
					{ id: 'proposal', label: 'Proposal review' },
					{ id: 'procurement', label: 'Procurement' }
				]
			},
			{
				id: 'recipient',
				title: 'Who are you following up with?',
				options: [
					{ id: 'champion', label: 'Champion' },
					{ id: 'committee', label: 'Buying committee' },
					{ id: 'procurement_team', label: 'Procurement team' }
				]
			},
			{
				id: 'primary_ask',
				title: 'What is the main ask?',
				options: [
					{ id: 'confirm_next_step', label: 'Confirm next step' },
					{ id: 'review_proposal', label: 'Review proposal' },
					{ id: 'answer_question', label: 'Answer open question' }
				]
			}
		],
		rules: [
			{
				id: 'procurement-stage',
				startingPointId: 'procurement-follow-up',
				answers: { deal_stage: 'procurement' }
			},
			{
				id: 'procurement-recipient',
				startingPointId: 'procurement-follow-up',
				answers: { recipient: 'procurement_team' }
			},
			{
				id: 'proposal-ask',
				startingPointId: 'proposal-review',
				answers: { primary_ask: 'review_proposal' }
			},
			{
				id: 'proposal-committee',
				startingPointId: 'proposal-review',
				answers: { deal_stage: 'proposal', recipient: 'committee' }
			},
			{ id: 'default', startingPointId: 'conversation-recap', answers: {} }
		]
	},
	variables,
	startingPoints: [
		{
			id: 'conversation-recap',
			label: 'Conversation recap',
			emailContent: {
				title: 'Follow-up from our conversation',
				to: ['Buyer'],
				cc: ['Deal team'],
				attachment: seededSpreadsheetAttachment('Deal recap tracker.xlsx', [
					[cell('Topic'), cell('Detail'), cell('Owner'), cell('Date')],
					[cell('Business goal'), cell(sheetVariable('business_goal')), cell(sheetVariable('buyer_name')), cell('Current')],
					[cell('Next step'), cell(sheetVariable('next_step')), cell(sheetVariable('deal_owner')), cell(sheetVariable('next_step_date'))]
				]),
				body: [
					paragraph('recap-greeting', [text('Hi '), variable('buyer_name'), text(',')]),
					paragraph('recap-summary', [
						text('Thanks for discussing '),
						variable('opportunity_name'),
						text(' and the goal of '),
						variable('business_goal'),
						text(' for '),
						variable('prospect_company'),
						text('.')
					]),
					paragraph('recap-stage', [
						text('The deal is currently in '),
						variable('deal_stage'),
						text(', with '),
						variable('next_step'),
						text(' planned for '),
						variable('next_step_date'),
						text('.')
					])
				]
			}
		},
		{
			id: 'proposal-review',
			label: 'Proposal review',
			emailContent: {
				title: 'Proposal follow-up',
				to: ['Buying committee'],
				cc: ['Deal team'],
				attachment: seededSpreadsheetAttachment('Proposal review.xlsx', [
					[cell('Area'), cell('Status'), cell('Owner'), cell('Notes')],
					[cell('Proposal'), cell(sheetVariable('proposal_link')), cell(sheetVariable('deal_owner')), cell('Ready for review')],
					[cell('Open question'), cell(sheetVariable('commercial_question')), cell(sheetVariable('buyer_name')), cell('Needs response')]
				]),
				body: [
					paragraph('proposal-greeting', [text('Hi '), variable('buyer_name'), text(',')]),
					paragraph('proposal-summary', [
						text('Sharing the proposal for '),
						variable('opportunity_name'),
						text(': '),
						variable('proposal_link'),
						text('.')
					]),
					paragraph('proposal-ask', [
						text('Please review it before '),
						variable('next_step_date'),
						text(' so we can confirm '),
						variable('next_step'),
						text('.')
					])
				]
			}
		},
		{
			id: 'procurement-follow-up',
			label: 'Procurement follow-up',
			emailContent: {
				title: 'Procurement follow-up',
				to: ['Procurement'],
				cc: ['Deal team'],
				attachment: seededSpreadsheetAttachment('Procurement checklist.xlsx', [
					[cell('Item'), cell('Owner'), cell('Status'), cell('Question')],
					[cell('Commercial review'), cell(sheetVariable('procurement_owner')), cell('Open'), cell(sheetVariable('commercial_question'))],
					[cell('Next step'), cell(sheetVariable('deal_owner')), cell(sheetVariable('next_step_date')), cell(sheetVariable('next_step'))]
				]),
				body: [
					paragraph('procurement-greeting', [text('Hi '), variable('buyer_name'), text(',')]),
					paragraph('procurement-summary', [
						text('Following up on procurement for '),
						variable('prospect_company'),
						text('. '),
						variable('procurement_owner'),
						text(' is the current owner on your side.')
					]),
					paragraph('procurement-question', [
						text('The open commercial question is: '),
						variable('commercial_question'),
						text('.')
					])
				]
			}
		}
	],
	showInGallery: true,
	modeSortOrder: 20,
	status: 'active'
});
