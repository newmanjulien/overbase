import { createBuilderAppRuntime } from '../builder-apps/runtime-core';

const runtime = createBuilderAppRuntime(process.env);

export const getBuilderAppRuntime = runtime.getBuilderAppRuntime;
