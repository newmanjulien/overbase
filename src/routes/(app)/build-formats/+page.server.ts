import { listBuilderGalleryEntries } from '../../../builders/registry';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		builders: listBuilderGalleryEntries(),
		headerTitle: 'Build formats'
	};
};
