import { listBuilderGalleryEntries } from '$lib/features/builder/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		builders: listBuilderGalleryEntries(),
		headerTitle: 'Build my formats'
	};
};
