import type { ReasonsToConnectExample } from './types';

export type { ReasonsToConnectExample } from './types';

export const reasonsToConnectExamples: ReasonsToConnectExample[] = [
	{
		to: ['Relationship partner'],
		cc: [],
		attachments: ['Client signal brief.pdf'],
		body: [
			{
				type: 'paragraph',
				text: 'Overbase found a new signal for {{client_name}} that may justify a timely client outreach.'
			},
			{
				type: 'bullets',
				items: [
					'Signal: {{client_signal}}.',
					'Why it matters: {{legal_or_business_relevance}}.',
					'Suggested outreach angle: {{outreach_angle}}.'
				]
			}
		],
		fireReason:
			'This email fires when a monitored client or prospect has a configured legal or business signal that creates a concrete reason to connect.'
	}
];
