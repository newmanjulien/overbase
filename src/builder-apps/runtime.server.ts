import { env } from '$env/dynamic/private';
import { customEmailBuilderManifest } from './custom-opportunity-format/definition';
import { CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG } from './ids';
import { getActiveBuilderAppPresentationEntry, mergeBuilderAppManifest } from './registry';
import { createExternalBuilderAppRuntime } from './runtime-core';

const externalRuntime = createExternalBuilderAppRuntime(env);

function getCustomOpportunityFormatManifest() {
	const presentation = getActiveBuilderAppPresentationEntry(CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG);

	return presentation ? mergeBuilderAppManifest(customEmailBuilderManifest, presentation) : null;
}

export async function getActiveBuilderAppManifest(slug: string) {
	if (slug === CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG) {
		return getCustomOpportunityFormatManifest();
	}

	return await externalRuntime.getActiveBuilderAppManifest(slug);
}

export const listBuilderHomeApps = externalRuntime.listBuilderHomeApps;
