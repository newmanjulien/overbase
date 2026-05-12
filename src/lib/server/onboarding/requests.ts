export type BusinessResearchRequest = {
	businessName: string;
	website: string;
};

export type GoToMarketResearchRequest = BusinessResearchRequest & {
	businessDescription: string;
};

export type BlueprintRecommendationRequest = {
	businessDescription: string;
	goToMarketDescription: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readStringField(body: Record<string, unknown>, field: string) {
	const value = body[field];

	return typeof value === 'string' ? value.trim() : '';
}

function requireStringField(body: Record<string, unknown>, field: string) {
	const value = readStringField(body, field);

	if (!value) {
		throw new Error(`${field} is required.`);
	}

	return value;
}

export async function readJsonRecord(request: Request) {
	const body = (await request.json()) as unknown;

	if (!isRecord(body)) {
		throw new Error('Request body must be a JSON object.');
	}

	return body;
}

export async function readBusinessResearchRequest(request: Request): Promise<BusinessResearchRequest> {
	const body = await readJsonRecord(request);

	return {
		businessName: requireStringField(body, 'businessName'),
		website: requireStringField(body, 'website')
	};
}

export async function readGoToMarketResearchRequest(
	request: Request
): Promise<GoToMarketResearchRequest> {
	const body = await readJsonRecord(request);

	return {
		businessName: requireStringField(body, 'businessName'),
		website: requireStringField(body, 'website'),
		businessDescription: requireStringField(body, 'businessDescription')
	};
}

export async function readBlueprintRecommendationRequest(
	request: Request
): Promise<BlueprintRecommendationRequest> {
	const body = await readJsonRecord(request);

	return {
		businessDescription: requireStringField(body, 'businessDescription'),
		goToMarketDescription: requireStringField(body, 'goToMarketDescription')
	};
}
