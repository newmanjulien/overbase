import { env } from '$env/dynamic/private';
import { createBuilderAppRuntime } from './runtime-core';

const runtime = createBuilderAppRuntime(env);

export const getActiveBuilderAppManifest = runtime.getActiveBuilderAppManifest;
export const listBuilderHomeApps = runtime.listBuilderHomeApps;
