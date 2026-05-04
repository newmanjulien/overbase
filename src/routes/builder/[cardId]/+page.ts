import { BUILDER_CARDS } from '$lib/features/builder-data';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const card = BUILDER_CARDS.find((candidate) => candidate.id === params.cardId);

	return {
		headerTitle: card ? card.title : 'Notification builder',
		headerTitleEditable: Boolean(card)
	};
};
