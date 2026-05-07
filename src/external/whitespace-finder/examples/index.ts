import type { WhitespaceFinderExample } from './types';

export type { WhitespaceFinderExample } from './types';

export const whitespaceFinderExamples: WhitespaceFinderExample[] = [
	{
		to: ['Account owner'],
		cc: [],
		attachments: ['Whitespace report.pdf'],
		body: [
			{
				type: 'paragraph',
				text: '{{client_name}} is approaching renewal, and Overbase found coverage gaps worth reviewing before the account plan is finalized.'
			},
			{
				type: 'bullets',
				items: [
					'Missing or underused coverage: {{coverage_gap}}.',
					'Reason this is relevant: {{gap_signal}}.',
					'Recommended next step: review the attached whitespace report with the account team.'
				]
			}
		],
		fireReason:
			'This email fires when a client enters the configured renewal window and Overbase finds one or more prioritized whitespace signals.'
	}
];
