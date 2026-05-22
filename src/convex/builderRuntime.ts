import { createExternalBuilderAppRuntime } from '../builder-apps/runtime-core';

const externalRuntime = createExternalBuilderAppRuntime(process.env);

export function getBuilderAppRuntime(slug: string) {
	return externalRuntime.getBuilderAppRuntime(slug);
}
