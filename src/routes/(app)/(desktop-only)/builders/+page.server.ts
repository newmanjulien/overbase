import { listBuilderCatalogHome } from '../../../../builders/catalog.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		builderHome: await listBuilderCatalogHome()
	};
};
