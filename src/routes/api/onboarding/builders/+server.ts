import { json, type RequestHandler } from '@sveltejs/kit';
import { listOnboardingBuilders } from '../../../../builder-apps/runtime.server';

export const GET: RequestHandler = async () => {
	const builderHome = await listOnboardingBuilders();

	return json({
		builders: builderHome.apps
	});
};
