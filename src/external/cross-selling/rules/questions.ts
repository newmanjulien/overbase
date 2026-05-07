import type { GuideDefinition } from '../types';

export const crossSellingGuide = {
	intro: "Let's build your Cross-selling notification. I just have a few quick questions.",
	questions: [
		{
			id: 'partner-signal',
			type: 'choice',
			title: 'What partner activity should trigger a cross-sell alert?',
			options: [
				'A partner wins a new account',
				'A partner expands an existing client relationship',
				'A shared client starts a new initiative',
				'A partner logs a meeting with a target account'
			],
			customAnswerPlaceholder: 'Describe another partner signal...'
		},
		{
			id: 'offer-match',
			type: 'choice',
			title: 'How should we decide there is a good offer match?',
			options: [
				'The client matches our ideal customer profile',
				'The client bought a complementary service',
				'Similar clients purchased our offer',
				'The account has an unresolved business need'
			],
			customAnswerPlaceholder: 'Describe another matching rule...'
		},
		{
			id: 'intro-note',
			type: 'text',
			title: 'What should the handoff note include?',
			placeholder: 'Describe the intro language, account context, or next step you want suggested...'
		}
	]
} satisfies GuideDefinition;
