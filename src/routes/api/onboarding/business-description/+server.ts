import { json, type RequestHandler } from '@sveltejs/kit';
import { researchBusinessDescription } from '$lib/server/onboarding/openai';
import { readBusinessResearchRequest } from '$lib/server/onboarding/requests';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const input = await readBusinessResearchRequest(request);
		const businessDescription = await researchBusinessDescription(input);

		return json({ businessDescription });
	} catch (error) {
		return json(
			{ message: error instanceof Error ? error.message : 'Unable to research this business.' },
			{ status: 400 }
		);
	}
};
