import { listBuilderHomeApps } from '../../builder-apps/runtime.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		builderHome: await listBuilderHomeApps()
	};
};
