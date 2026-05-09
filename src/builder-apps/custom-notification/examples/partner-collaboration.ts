import type { CustomEmailExamples } from './types';

export const partnerCollaborationExamples = {
	slug: 'partner-collaboration',
	description:
		'Notifications that alert the right non-lawyer teams when a partner firm has client activity that may create a collaboration opportunity.',
	// The AI sometimes uses this text more literally than it should, so write it as user-facing question copy.
	questionGuidance:
		'Which partner-firm clients, matter types, or client segment should trigger this alert?',
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
