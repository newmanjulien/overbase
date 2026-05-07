import type { GuideDefinition } from '../types';

export const reasonsToConnectGuide = {
	intro: "Let's build your Reasons to connect notification. I just have a few quick questions.",
	questions: [
		{
			id: 'legal-signal',
			type: 'choice',
			title: 'What should count as a reason to connect?',
			options: [
				'A client announces a leadership change',
				'A regulatory update affects their industry',
				'A client opens a new office or market',
				'A relevant lawsuit or enforcement action appears'
			],
			customAnswerPlaceholder: 'Describe another signal...'
		},
		{
			id: 'client-scope',
			type: 'choice',
			title: 'Which clients should be monitored?',
			options: [
				'My active clients only',
				'Priority clients across my practice group',
				'Clients with open matters in the last year',
				'Prospects assigned to my team'
			],
			customAnswerPlaceholder: 'Define another client group...'
		},
		{
			id: 'outreach-context',
			type: 'text',
			title: 'What context should the alert include?',
			placeholder: 'Describe the talking points, matter history, or legal reasoning to include...'
		}
	]
} satisfies GuideDefinition;
