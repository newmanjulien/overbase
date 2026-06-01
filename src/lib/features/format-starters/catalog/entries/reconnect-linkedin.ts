import {
	formatParagraph as paragraph,
	formatText as text,
	formatVariable as variable
} from '$lib/features/format-starters/domain';
import { defineFormatStarter, seededSpreadsheetAttachment, spreadsheetCell as cell } from './helpers';

const teamMemberReconnectEmailContent = {
	title: 'Reconnect with contacts',
	to: ['Team member'],
	cc: ['You'],
	attachment: seededSpreadsheetAttachment('Score 10 contacts.xlsx', [
		[
			cell('Worth reconnecting?'),
			cell('Name'),
			cell('Company'),
			cell('Role'),
			cell('LinkedIn profile')
		],
		[cell(variable('yesno'))]
	]),
	body: [
		paragraph('linkedin-greeting', [text('Hey '), variable('team_member'), text(',')]),
		paragraph('linkedin-signal', [
			text('Ajay Agrawal just started a new role at Mastercard ('),
			variable('link'),
			text(').')
		]),
		paragraph('linkedin-contact-options', [
			text('His likely email there is '),
			variable('email'),
			text(' or you might DM him at: '),
			variable('linkedin_url')
		]),
		paragraph('linkedin-close', [
			text(
				'If you have two minutes, filling out the attached spreadsheet would help me find the best people to propose.'
			)
		])
	]
};

const personalReconnectEmailContent = {
	...teamMemberReconnectEmailContent,
	to: ['You'],
	cc: []
};

export const reconnectLinkedinFormatStarter = defineFormatStarter({
	slug: 'reconnect-linkedin',
	formatDefinitionSlug: 'reconnect-linkedin',
	title: 'Reconnect with contacts',
	description: 'Find news that lets your team reconnect with their LinkedIn contacts',
	details: {
		paragraphs: [
			"This is a simple email format that's designed to only use public data",
			"We'll use each team member's public LinkedIn contacts then find news that lets them easily reconnect"
		]
	},
	artwork: {
		id: 'reconnect-linkedin-mint',
		iconId: 'linkedin-logo',
		card: {
			tone: 'mint'
		},
		panel: {
			backColor: '#B7E4C7',
			frontColor: '#E4F7D2',
			iconCenterX: '58%',
			iconCenterY: '47%'
		}
	},
	startingPointSelection: {
		kind: 'guided',
		intro:
			"Let's create an email format that helps your team easily reconnect with their LinkedIn contacts. We'll take LinkedIn contacts then find news that gives an easy reason to reconnect",
		infoBar: {
			label: 'Tip:',
			content: [
				{
					kind: 'text',
					text: "Pick 'just for me' to quickly and easily try out this format"
				}
			]
		},
		questions: [
			{
				id: 'format_audience',
				title: 'Who should we create this format for?',
				options: [
					{ id: 'just_me', label: 'Create it just for me' },
					{ id: 'senior_leadership', label: 'For our senior leaders' },
					{ id: 'team', label: 'For a variety of people on our team' }
				]
			}
		],
		rules: [
			{
				id: 'senior-leadership',
				startingPointId: 'linkedin-reconnect-senior-leadership',
				answers: { format_audience: 'senior_leadership' }
			},
			{
				id: 'team',
				startingPointId: 'linkedin-reconnect-team',
				answers: { format_audience: 'team' }
			},
			{
				id: 'default',
				startingPointId: 'linkedin-reconnect',
				answers: {}
			}
		]
	},
	startingPoints: [
		{
			id: 'linkedin-reconnect',
			label: 'Reconnect with contacts',
			initialRecipients: 'viewer',
			emailContent: personalReconnectEmailContent
		},
		{
			id: 'linkedin-reconnect-team',
			label: 'Reconnect with contacts for team members',
			initialRecipients: 'none',
			ruleDataSourceAction: { label: 'No data needed', disabled: true },
			emailContent: teamMemberReconnectEmailContent
		},
		{
			id: 'linkedin-reconnect-senior-leadership',
			label: 'Reconnect with contacts for senior leadership',
			initialRecipients: 'none',
			ruleDataSourceAction: { label: 'No data needed', disabled: true },
			emailContent: {
				title: 'Reconnect with contacts',
				to: ["Senior leader's assistant"],
				cc: ['Senior leader', 'You'],
				attachment: seededSpreadsheetAttachment('Score 10 contacts.xlsx', [
					[
						cell('Worth reconnecting?'),
						cell('Name'),
						cell('Company'),
						cell('Role'),
						cell('LinkedIn profile')
					],
					[cell(variable('yesno'))]
				]),
				body: [
					paragraph('linkedin-senior-greeting', [text('Hey '), variable('assistant'), text(',')]),
					paragraph('linkedin-senior-signal', [
						variable('senior_leader'),
						text("'s contact Ajay Agrawal just started a new role at Mastercard ("),
						variable('link'),
						text(').')
					]),
					paragraph('linkedin-senior-contact-options', [
						text("Ajay's likely email there is "),
						variable('email'),
						text(' or '),
						variable('senior_leader'),
						text(' might DM him at: '),
						variable('linkedin_url')
					]),
					paragraph('linkedin-senior-close', [
						variable('senior_leader'),
						text(
							': if you have two minutes, filling out the attached spreadsheet would help me find the best people to propose.'
						)
					])
				]
			}
		}
	],
	showInGallery: true,
	modeSortOrder: 10,
	status: 'active'
});
