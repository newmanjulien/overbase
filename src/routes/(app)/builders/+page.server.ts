import { BUILDER_VIEWPORT_REQUIREMENT } from '$lib/features/builder/builder-route-data';
import { listBuilderHomeApps } from '../../../builder-apps/runtime.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		builderHome: await listBuilderHomeApps(),
		viewportRequirement: BUILDER_VIEWPORT_REQUIREMENT
	};
};
