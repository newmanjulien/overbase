import type { CustomEmailExamples } from './types';

export const partnerCollaborationExamples = {
	slug: 'partner-collaboration',
	description:
		'Notifications that alert the right non-lawyer teams when a partner firm has client activity that may create a collaboration opportunity.',
	questionGuidance:
		'For named partner-firm requests, ask which client, matter type, or client segment should trigger the alert. Use this shape when possible: Which [partner] client(s) or client segment should trigger this alert (specific names or criteria)?',
	examples: [
		{
			slug: 'partner-client-collaboration',
			description:
				'An alert to marketing or business development teams when a partner firm logs client activity that may be a reason to collaborate.',
			matchSignals: [
				'partner firm client might need our help',
				'Davies client needs help',
				'marketing people on both teams',
				'not lawyers',
				'propose times both available',
				'partner CRM matter',
				'client matter could involve US work',
				'cross-firm collaboration',
				'business development handoff',
				'M&A matter partner firm'
			],
			emailDraft: {
				to: ['Marketing - Our Firm', 'Marketing - Davies'],
				cc: [],
				attachments: [],
				body: [
					{
						type: 'paragraph',
						text: 'Hey folks,'
					},
					{
						type: 'paragraph',
						text: "Air Canada just hired Davies to help with bidding on some of Spirit Airlines' assets."
					},
					{
						type: 'paragraph',
						text: "Not sure if there's an opportunity to partner up."
					},
					{
						type: 'paragraph',
						text: 'But if there is, you both seem to be available today at 2pm and 3pm ET.'
					}
				],
				fireReason:
					'The email fires when Davies tracks in their CRM that they have been hired for a matter which could involve US work.'
			}
		}
	]
} satisfies CustomEmailExamples;
