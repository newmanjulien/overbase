import type { BuilderCardId } from '$lib/features/builder-data/builder-cards';
import type { BuilderGuideDefinition } from '$lib/features/builder-guide/guide-types';

export const BUILDER_GUIDE_DEFINITIONS: Partial<Record<BuilderCardId, BuilderGuideDefinition>> = {
	'bring-the-firm': {
		intro: 'Let’s build your Bring the firm notification. I just have a few quick questions.',
		questions: [
			{
				id: 'meeting-trigger',
				type: 'choice',
				title: 'When should we recommend colleagues to bring in?',
				options: [
					'A client meeting is added to my calendar',
					'A pursuit reaches proposal stage',
					'A dormant account schedules a check-in',
					'A strategic account has new stakeholder activity'
				],
				customAnswerPlaceholder: 'Describe another moment...'
			},
			{
				id: 'expertise-signal',
				type: 'choice',
				title: 'What kind of colleague should we look for?',
				options: [
					'Someone with relevant industry experience',
					'Someone who knows the account personally',
					'Someone with a matching service-line specialty',
					'Someone who worked on a similar deal'
				],
				customAnswerPlaceholder: 'Describe the expertise you want...'
			},
			{
				id: 'delivery-channel',
				type: 'text',
				title: 'What context should the recommendation include?',
				placeholder: 'Describe the client context, meeting notes, or expertise signals to include...'
			}
		]
	},
	'whitespace-finder': {
		intro: 'Let’s build your Whitespace finder notification. I just have a few quick questions.',
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
				placeholder: 'Describe exclusions, minimum premium thresholds, client segments, or timing rules...'
			}
		]
	},
	'reasons-to-connect': {
		intro: 'Let’s build your Reasons to connect notification. I just have a few quick questions.',
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
	},
	'cross-selling': {
		intro: 'Let’s build your Cross-selling notification. I just have a few quick questions.',
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
	}
} satisfies Partial<Record<BuilderCardId, BuilderGuideDefinition>>;

export function getBuilderGuideDefinition(cardId: BuilderCardId) {
	return BUILDER_GUIDE_DEFINITIONS[cardId] ?? null;
}
