import { CUSTOM_EMAIL_BUILDER_APP_ID } from '../../builder-apps/ids';
import type { AppCatalogDefinition } from './types';

export const customEmailBuilderCatalog = {
	slug: CUSTOM_EMAIL_BUILDER_APP_ID,
	categoryIds: [],
	title: 'Build your notification',
	description: 'Explain the format of the emails you want your team to receive',
	artwork: {
		id: 'spark-coral',
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
	},
	showInGallery: false,
	sortOrder: 50,
	status: 'active',
	mode: 'custom',
	guide: null
} satisfies AppCatalogDefinition;
