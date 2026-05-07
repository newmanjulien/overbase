import { whitespaceFinderGuide } from './rules/questions';
import type { AppCatalogDefinition } from './types';

export const whitespaceFinderCatalog = {
	slug: 'whitespace-finder',
	categoryIds: ['insurance'],
	title: 'Whitespace finder',
	description: 'Receive a report 3 months before renewals with new policies each client could buy',
	artwork: {
		id: 'search-aqua',
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
	showInGallery: true,
	sortOrder: 20,
	status: 'active',
	mode: 'guided',
	guide: whitespaceFinderGuide
} satisfies AppCatalogDefinition;
