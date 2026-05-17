import { json, type RequestHandler } from '@sveltejs/kit';
import { listBuilderHomeApps } from '../../../../builder-apps/runtime.server';

export const GET: RequestHandler = async () => {
	const builderHome = await listBuilderHomeApps();

	return json({
		blueprints: builderHome.apps
	});
};
