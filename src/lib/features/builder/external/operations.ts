import { bringTheFirmApp } from '../../../../external/bring-the-firm';
import { crossSellingApp } from '../../../../external/cross-selling';
import { reasonsToConnectApp } from '../../../../external/reasons-to-connect';
import { whitespaceFinderApp } from '../../../../external/whitespace-finder';
import type { EmailExternalAppDefinition } from './types';

export const emailExternalApps = [
	bringTheFirmApp,
	whitespaceFinderApp,
	reasonsToConnectApp,
	crossSellingApp
] satisfies EmailExternalAppDefinition[];

export function getEmailExternalApp(slug: string) {
	return emailExternalApps.find((app) => app.slug === slug) ?? null;
}
