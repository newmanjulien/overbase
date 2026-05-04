import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { BuilderCardRecord } from '$lib/features/builder-data';

export async function submitBuilderCard(card: BuilderCardRecord) {
	await goto(resolve('/builder/[cardId]', { cardId: card.id }));
}
