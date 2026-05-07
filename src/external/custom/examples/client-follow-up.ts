import type { CustomEmailExamples } from './types';

export const clientFollowUpExamples = {
	slug: 'client-follow-up',
	description: 'Notifications that help a relationship owner follow up with clients or prospects.',
	questionGuidance:
		'Ask what specific relationship owner, client segment, or follow-up timing should be used.',
	examples: [
		{
			slug: 'weekly-missing-follow-up',
			description: 'A weekly email listing clients who have not received a promised follow-up.',
			matchSignals: [
				'follow up after meetings',
				'missing next steps',
				'weekly relationship owner reminders',
				'client promises not completed'
			],
			emailDraft: {
				to: ['Relationship owner'],
				cc: ['Practice lead'],
				attachments: ['Missing Follow Ups.pdf'],
				body: [
					{
						type: 'paragraph',
						text: 'Here are the client conversations from last week that still need a confirmed follow-up.'
					},
					{
						type: 'bullets',
						items: ['Client and meeting date', 'Promised next step', 'Owner and days since meeting']
					},
					{
						type: 'paragraph',
						text: 'Please reply once the follow-up has been sent or update the owner if this should be reassigned.'
					}
				],
				fireReason:
					'The email fires when a completed client meeting has an unresolved promised next step after the follow-up window has passed.'
			}
		}
	]
} satisfies CustomEmailExamples;
