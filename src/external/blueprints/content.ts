export const notificationCategories = [
	{
		slug: 'consulting',
		label: 'Consulting',
		iconId: 'briefcase-business',
		sortOrder: 0
	},
	{
		slug: 'insurance',
		label: 'Insurance',
		iconId: 'shield-check',
		sortOrder: 10
	},
	{
		slug: 'law',
		label: 'Law',
		iconId: 'scale',
		sortOrder: 20
	},
	{
		slug: 'manufacturing',
		label: 'Manufacturing',
		iconId: 'factory',
		sortOrder: 30
	}
] as const;

export const notificationArtworkPresets = [
	{
		slug: 'team-violet',
		card: {
			tone: 'violet',
			iconId: 'users-round',
			symbolSize: 'md'
		},
		panel: {
			backColor: '#9DE5F3',
			frontColor: '#DFA0F4',
			iconId: 'users-round',
			iconCenterX: '60%',
			iconCenterY: '46%'
		}
	},
	{
		slug: 'search-aqua',
		card: {
			tone: 'aqua',
			iconId: 'scan-search',
			symbolSize: 'md'
		},
		panel: {
			backColor: '#FFA0A1',
			frontColor: '#DDFB93',
			iconId: 'scan-search',
			iconCenterX: '60%',
			iconCenterY: '46%'
		}
	},
	{
		slug: 'alert-coral',
		card: {
			tone: 'coral',
			iconId: 'bell-ring',
			symbolSize: 'md'
		},
		panel: {
			backColor: '#DDFB93',
			frontColor: '#FFA0A1',
			iconId: 'bell-ring',
			iconCenterX: '60%',
			iconCenterY: '46%'
		}
	},
	{
		slug: 'network-zinc',
		card: {
			tone: 'zinc',
			iconId: 'network',
			symbolSize: 'md'
		},
		panel: {
			backColor: '#9DE5F3',
			frontColor: '#DFA0F4',
			iconId: 'network',
			iconCenterX: '60%',
			iconCenterY: '46%'
		}
	},
	{
		slug: 'spark-coral',
		card: {
			tone: 'coral',
			iconId: 'sparkles',
			symbolSize: 'md'
		},
		panel: {
			backColor: '#DDFB93',
			frontColor: '#9DE5F3',
			iconId: 'sparkles',
			iconCenterX: '60%',
			iconCenterY: '46%'
		}
	}
] as const;

export const notificationProducts = [
	{
		slug: 'bring-the-firm',
		categoryIds: ['consulting', 'law'],
		title: 'Bring the firm',
		description: 'Receive recommendations of colleagues to bring to meetings',
		artworkPresetSlug: 'team-violet',
		showInGallery: true,
		sortOrder: 10,
		status: 'active',
		mode: 'guided'
	},
	{
		slug: 'whitespace-finder',
		categoryIds: ['insurance'],
		title: 'Whitespace finder',
		description: 'Receive a report 3 months before renewals with new policies each client could buy',
		artworkPresetSlug: 'search-aqua',
		showInGallery: true,
		sortOrder: 20,
		status: 'active',
		mode: 'guided'
	},
	{
		slug: 'reasons-to-connect',
		categoryIds: ['law'],
		title: 'Reasons to connect',
		description: 'Receive an email when a client might have a legal issue they need your help with',
		artworkPresetSlug: 'alert-coral',
		showInGallery: true,
		sortOrder: 30,
		status: 'active',
		mode: 'guided'
	},
	{
		slug: 'cross-selling',
		categoryIds: ['consulting', 'insurance', 'law', 'manufacturing'],
		title: 'Cross-selling',
		description: 'Receive an email when your partner has a client you could be selling to',
		artworkPresetSlug: 'network-zinc',
		showInGallery: true,
		sortOrder: 40,
		status: 'active',
		mode: 'guided'
	},
	{
		slug: 'custom-notification',
		categoryIds: [],
		title: 'Build your notification',
		description: 'Explain the format of the emails you want your team to receive',
		artworkPresetSlug: 'spark-coral',
		showInGallery: false,
		sortOrder: 50,
		status: 'active',
		mode: 'custom'
	}
] as const;

export const notificationGuides = [
	{
		productSlug: 'bring-the-firm',
		intro: "Let's build your Bring the firm notification. I just have a few quick questions.",
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
	{
		productSlug: 'whitespace-finder',
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
	},
	{
		productSlug: 'reasons-to-connect',
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
	},
	{
		productSlug: 'cross-selling',
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
	}
] as const;

export type NotificationCategory = (typeof notificationCategories)[number];
export type NotificationArtworkPreset = (typeof notificationArtworkPresets)[number];
export type NotificationProduct = (typeof notificationProducts)[number];
export type NotificationGuide = (typeof notificationGuides)[number];

export function getNotificationArtworkPreset(slug: string) {
	return notificationArtworkPresets.find((artwork) => artwork.slug === slug) ?? null;
}

export function getActiveNotificationProduct(slug: string) {
	return notificationProducts.find((product) => product.slug === slug && product.status === 'active') ?? null;
}

export function getNotificationGuide(productSlug: string) {
	return notificationGuides.find((guide) => guide.productSlug === productSlug) ?? null;
}

export function listNotificationHomeProducts() {
	const categories = [...notificationCategories].sort((left, right) => left.sortOrder - right.sortOrder);
	const products = notificationProducts
		.filter((product) => product.showInGallery && product.status === 'active')
		.sort((left, right) => left.sortOrder - right.sortOrder);

	return { categories, products };
}
