import type { CustomEmailExamples } from './types';

export const teamOperationsExamples = {
	slug: 'team-operations',
	description: 'Notifications that summarize exceptions, misses, or recurring team workflow changes.',
	// The AI sometimes uses this text more literally than it should, so write it as user-facing question copy.
	questionGuidance: 'Which team, cadence, or exception threshold matters most for the workflow?',
	examples: [
		{
			slug: 'team-exception-digest',
			description: 'A digest of workflow exceptions that need team attention.',
			matchSignals: ['team digest', 'workflow exceptions', 'operations summary', 'missed tasks'],
			emailDraft: {
				to: ['Team manager'],
				cc: [],
				attachments: ['Team Exception Digest.pdf'],
				body: [
					{
						type: 'paragraph',
						text: 'Here are the workflow exceptions that need review before the next team checkpoint.'
					},
					{
						type: 'bullets',
						items: ['Exception type', 'Owner', 'Age and next action']
					},
					{
						type: 'paragraph',
						text: 'Please assign owners for unresolved items or mark exceptions that no longer require action.'
					}
				]
			}
		}
	]
} satisfies CustomEmailExamples;
