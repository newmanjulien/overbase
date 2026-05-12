import { json, type RequestHandler } from '@sveltejs/kit';
import { recommendBlueprints } from '$lib/server/onboarding/recommendations';
import { readBlueprintRecommendationRequest } from '$lib/server/onboarding/requests';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const input = await readBlueprintRecommendationRequest(request);
		const blueprints = await recommendBlueprints(input);

		return json({ blueprints });
	} catch (error) {
		return json(
			{ message: error instanceof Error ? error.message : 'Unable to recommend blueprints.' },
			{ status: 400 }
		);
	}
};
