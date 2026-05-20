import { toBuilderAppRecord, type BuilderAppRecord } from '$lib/features/builder/catalog';
import type { BuilderAppRegistryEntry } from '../../../builder-apps/registry';

type OnboardingBuildersResponse = {
	builders: BuilderAppRegistryEntry[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getErrorMessage(body: unknown) {
	return isRecord(body) && typeof body.message === 'string'
		? body.message
		: 'Unable to load builders.';
}

function parseOnboardingBuildersResponse(body: unknown): OnboardingBuildersResponse {
	const builders = isRecord(body) ? body.builders : null;

	if (!Array.isArray(builders)) {
		throw new Error('Onboarding returned invalid builders.');
	}

	return { builders: builders as BuilderAppRegistryEntry[] };
}

export async function loadOnboardingBuilders(): Promise<BuilderAppRecord[]> {
	const response = await fetch('/api/onboarding/builders');
	const body = (await response.json()) as unknown;

	if (!response.ok) {
		throw new Error(getErrorMessage(body));
	}

	const { builders } = parseOnboardingBuildersResponse(body);

	return builders.map(toBuilderAppRecord);
}
