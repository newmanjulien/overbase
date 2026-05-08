import { env } from '$env/dynamic/private';
import { customEmailBuilderManifest } from './custom-notification/definition';
import { CUSTOM_NOTIFICATION_APP_SLUG } from './ids';
import { getActiveBuilderAppPresentationEntry, mergeBuilderAppManifest } from './registry';
import { createExternalBuilderAppRuntime } from './runtime-core';

const externalRuntime = createExternalBuilderAppRuntime(env);

function getCustomNotificationManifest() {
	const presentation = getActiveBuilderAppPresentationEntry(CUSTOM_NOTIFICATION_APP_SLUG);

	return presentation ? mergeBuilderAppManifest(customEmailBuilderManifest, presentation) : null;
}

export async function getActiveBuilderAppManifest(slug: string) {
	if (slug === CUSTOM_NOTIFICATION_APP_SLUG) {
		return getCustomNotificationManifest();
	}

	return await externalRuntime.getActiveBuilderAppManifest(slug);
}

export const listBuilderHomeApps = externalRuntime.listBuilderHomeApps;
