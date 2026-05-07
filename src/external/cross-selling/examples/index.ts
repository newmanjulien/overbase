import type { CrossSellingExample } from './types';

export type { CrossSellingExample } from './types';

export const crossSellingExamples: CrossSellingExample[] = [
	{
		to: ['Commercial owner'],
		cc: ['Partner owner'],
		attachments: ['Cross-sell context.pdf'],
		body: [
			{
				type: 'paragraph',
				text: '{{partner_name}} had activity with {{client_name}}, and Overbase found a possible cross-sell match for your team.'
			},
			{
				type: 'bullets',
				items: [
					'Partner signal: {{partner_signal}}.',
					'Offer match: {{offer_match_reason}}.',
					'Suggested handoff: {{handoff_note}}.'
				]
			}
		],
		fireReason:
			'This email fires when configured partner activity matches a client or account that appears relevant for a cross-selling motion.'
	}
];
