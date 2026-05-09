import { CUSTOM_NOTIFICATION_APP_SLUG } from '../builder-apps/ids';
import { createCustomNotificationRuntimeDependencies } from '../builder-apps/custom-notification/dependencies';
import { createCustomNotificationRuntime } from '../builder-apps/custom-notification/runtime';
import { createExternalBuilderAppRuntime } from '../builder-apps/runtime-core';

const externalRuntime = createExternalBuilderAppRuntime(process.env);
const customNotificationRuntime = createCustomNotificationRuntime(
	createCustomNotificationRuntimeDependencies(process.env)
);

export function getBuilderAppRuntime(slug: string) {
	if (slug === CUSTOM_NOTIFICATION_APP_SLUG) {
		return customNotificationRuntime;
	}

	return externalRuntime.getBuilderAppRuntime(slug);
}
