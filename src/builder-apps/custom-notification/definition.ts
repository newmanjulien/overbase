import type { BuilderAppManifest } from './types';
import { CUSTOM_NOTIFICATION_APP_SLUG } from '../ids';

export const customEmailBuilderManifest = {
	slug: CUSTOM_NOTIFICATION_APP_SLUG,
	title: 'Build your notification',
	description: 'Explain the format of the emails you want your team to receive',
	details: {
		paragraphs: [
			'Overbase turns a plain-language request into a custom email notification. The builder helps define what changed, why it matters, who should receive it, and how the update should read.',
			'Once the notification is drafted, you can review the email, edit the details, and keep refining it with the builder until it matches the workflow your team needs.'
		]
	},
	mode: 'custom',
	guide: null
} satisfies BuilderAppManifest;
