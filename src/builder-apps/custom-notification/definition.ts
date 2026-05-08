import type { BuilderAppManifest } from './types';
import { CUSTOM_NOTIFICATION_APP_SLUG } from '../ids';

export const customEmailBuilderManifest = {
	slug: CUSTOM_NOTIFICATION_APP_SLUG,
	title: 'Build your notification',
	description: 'Explain the format of the emails you want your team to receive',
	mode: 'custom',
	guide: null
} satisfies BuilderAppManifest;
