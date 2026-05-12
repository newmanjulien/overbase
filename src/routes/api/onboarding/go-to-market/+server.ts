import { json, type RequestHandler } from '@sveltejs/kit';
import { researchGoToMarketDescription } from '$lib/server/onboarding/openai';
import { readGoToMarketResearchRequest } from '$lib/server/onboarding/requests';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const input = await readGoToMarketResearchRequest(request);
		const goToMarketDescription = await researchGoToMarketDescription(input);

		return json({ goToMarketDescription });
	} catch (error) {
		return json(
			{ message: error instanceof Error ? error.message : 'Unable to research go-to-market.' },
			{ status: 400 }
		);
	}
};
