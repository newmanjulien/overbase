import type { GuideDefinition } from '../types';

export const whitespaceFinderGuide = {
	intro: "Let's build your Whitespace finder notification. I just have a few quick questions.",
	questions: [
		{
			id: 'renewal-window',
			type: 'choice',
			title: 'When should we start looking for whitespace?',
			options: [
				'30 days before renewal',
				'60 days before renewal',
				'90 days before renewal',
				'When usage changes materially'
			],
			customAnswerPlaceholder: 'Define another timing rule...'
		},
		{
			id: 'coverage-gap',
			type: 'choice',
			title: 'Which gaps should be prioritized?',
			options: [
				'Policies similar clients usually carry',
				'Products this client has quoted before',
				'Coverage tied to new locations or employees',
				'High-margin products with low adoption'
			],
			customAnswerPlaceholder: 'Describe another gap signal...'
		},
		{
			id: 'report-rule',
			type: 'text',
			title: 'What rule should the whitespace report always respect?',
			placeholder:
				'Describe exclusions, minimum premium thresholds, client segments, or timing rules...'
		}
	]
} satisfies GuideDefinition;
