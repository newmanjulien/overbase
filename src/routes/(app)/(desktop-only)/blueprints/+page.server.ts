import { listBlueprints } from '../../../../blueprints/registry';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		blueprints: listBlueprints(),
		headerTitle: 'Blueprints'
	};
};
