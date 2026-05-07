import { reasonsToConnectGuide } from './rules/questions';
import type { AppCatalogDefinition } from './types';

export const reasonsToConnectCatalog = {
	slug: 'reasons-to-connect',
	categoryIds: ['law'],
	title: 'Reasons to connect',
	description: 'Receive an email when a client might have a legal issue they need your help with',
	artwork: {
		id: 'alert-coral',
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
	showInGallery: true,
	sortOrder: 30,
	status: 'active',
	mode: 'guided',
	guide: reasonsToConnectGuide
} satisfies AppCatalogDefinition;
