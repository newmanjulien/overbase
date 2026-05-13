import { CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG } from '../builder-apps/ids';
import { createCustomOpportunityFormatRuntimeDependencies } from '../builder-apps/custom-opportunity-format/dependencies';
import { createCustomOpportunityFormatRuntime } from '../builder-apps/custom-opportunity-format/runtime';
import { createExternalBuilderAppRuntime } from '../builder-apps/runtime-core';

const externalRuntime = createExternalBuilderAppRuntime(process.env);
const customOpportunityFormatRuntime = createCustomOpportunityFormatRuntime(
	createCustomOpportunityFormatRuntimeDependencies(process.env)
);

export function getBuilderAppRuntime(slug: string) {
	if (slug === CUSTOM_OPPORTUNITY_FORMAT_APP_SLUG) {
		return customOpportunityFormatRuntime;
	}

	return externalRuntime.getBuilderAppRuntime(slug);
}
