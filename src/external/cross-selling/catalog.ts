import { crossSellingGuide } from './rules/questions';
import type { AppCatalogDefinition } from './types';

export const crossSellingCatalog = {
	slug: 'cross-selling',
	categoryIds: ['consulting', 'insurance', 'law', 'manufacturing'],
	title: 'Cross-selling',
	description: 'Receive an email when your partner has a client you could be selling to',
	artwork: {
		id: 'network-zinc',
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
	showInGallery: true,
	sortOrder: 40,
	status: 'active',
	mode: 'guided',
	guide: crossSellingGuide
} satisfies AppCatalogDefinition;
