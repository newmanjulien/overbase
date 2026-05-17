import { toBuilderAppRecord, type BuilderAppRecord } from '$lib/features/builder/catalog';
import type { BuilderAppRegistryEntry } from '../../../builder-apps/registry';

type OnboardingBlueprintsResponse = {
	blueprints: BuilderAppRegistryEntry[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getErrorMessage(body: unknown) {
	return isRecord(body) && typeof body.message === 'string'
		? body.message
		: 'Unable to load blueprints.';
}

function parseOnboardingBlueprintsResponse(body: unknown): OnboardingBlueprintsResponse {
	const blueprints = isRecord(body) ? body.blueprints : null;

	if (!Array.isArray(blueprints)) {
		throw new Error('Onboarding returned invalid blueprints.');
	}

	return { blueprints: blueprints as BuilderAppRegistryEntry[] };
}

export async function loadOnboardingBlueprints(): Promise<BuilderAppRecord[]> {
	const response = await fetch('/api/onboarding/blueprints');
	const body = (await response.json()) as unknown;

	if (!response.ok) {
		throw new Error(getErrorMessage(body));
	}

	const { blueprints } = parseOnboardingBlueprintsResponse(body);

	return blueprints.map(toBuilderAppRecord);
}
