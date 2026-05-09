import type { CustomEmailExamples } from './types';

export const pipelineRiskExamples = {
	slug: 'pipeline-risk',
	description: 'Notifications that surface stalled, risky, or changing commercial opportunities.',
	// The AI sometimes uses this text more literally than it should, so write it as user-facing question copy.
	questionGuidance:
		'Which deal stage, account owner, or risk threshold should trigger the alert?',
	examples: [
		{
			slug: 'stalled-opportunity',
			description: 'A pipeline alert when an opportunity has not moved for a defined number of days.',
			matchSignals: ['stalled deals', 'opportunity has not advanced', 'pipeline risk', 'proposal stuck'],
			emailDraft: {
				to: ['Opportunity owner'],
				cc: ['Sales manager'],
				attachments: ['Stalled Opportunity Detail.pdf'],
				body: [
					{
						type: 'paragraph',
						text: 'This opportunity appears stalled and may need manager attention before the next forecast review.'
					},
					{
						type: 'bullets',
						items: ['Current stage and value', 'Days without stage movement', 'Last client interaction']
					},
					{
						type: 'paragraph',
						text: 'Confirm whether the next step is still active, and update the close plan if the opportunity should stay in forecast.'
					}
				]
			}
		}
	]
} satisfies CustomEmailExamples;
