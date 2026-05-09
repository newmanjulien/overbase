import type { CustomEmailExamples } from './types';

export const marketSignalExamples = {
	slug: 'market-signal',
	description: 'Notifications triggered by outside events that create a timely reason to connect.',
	// The AI sometimes uses this text more literally than it should, so write it as user-facing question copy.
	questionGuidance:
		'Which clients or markets should be monitored so the alert does not become too broad?',
	examples: [
		{
			slug: 'leadership-change',
			description: 'A timely reason-to-connect email when a watched company announces a leadership change.',
			matchSignals: ['leadership change', 'new executive', 'client news', 'reason to connect'],
			emailDraft: {
				to: ['Client relationship partner'],
				cc: [],
				attachments: ['Leadership Change Brief.pdf'],
				body: [
					{
						type: 'paragraph',
						text: 'A watched client or prospect announced a leadership change that may create a timely reason to connect.'
					},
					{
						type: 'bullets',
						items: ['Company and new leader', 'Role and effective date', 'Relevant relationship context']
					},
					{
						type: 'paragraph',
						text: 'Consider sending a short note and checking whether this creates any new priorities for the account.'
					}
				],
				fireReason:
					'The email fires when a monitored client or prospect has a new senior leader announced in a trusted external source.'
			}
		},
		{
			slug: 'regulatory-watch',
			description: 'An alert when a new regulatory update affects watched clients or industries.',
			matchSignals: ['regulatory update', 'compliance change', 'industry alert', 'legal issue'],
			emailDraft: {
				to: ['Account partner'],
				cc: ['Subject matter expert'],
				attachments: ['Regulatory Watch Summary.pdf'],
				body: [
					{
						type: 'paragraph',
						text: 'A new regulatory update may affect clients in your watched portfolio.'
					},
					{
						type: 'bullets',
						items: ['Affected industry or jurisdiction', 'Relevant clients', 'Suggested talking point']
					},
					{
						type: 'paragraph',
						text: 'Review the attached summary before reaching out so the message is specific to the client context.'
					}
				],
				fireReason:
					'The email fires when a trusted source publishes a regulatory update that matches the monitored client industry, location, or service need.'
			}
		}
	]
} satisfies CustomEmailExamples;
