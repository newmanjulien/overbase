import type {
	BuilderAppBackgroundJobInput,
	BuilderAppContinueTurnInput,
	BuilderAppStartTurnInput
} from '@overbase/builder-sdk/app-protocol';
import type { BuilderAppPresentation } from './presentation';
import { getBuilderAppRegistryEntry } from './manifest-client';
import {
	getActiveBuilderAppPresentationEntry,
	listBuilderHomeCategories,
	listBuilderHomePresentationEntries
} from './registry';
import { callRuntime, relayAssistantDelta } from './runtime-client';
import {
	assertRuntimePresentationCoverage,
	hasRuntimeConfig,
	type BuilderRuntimeEnv
} from './runtime-config';

export type { BuilderRuntimeEnv } from './runtime-config';

function filterCategoriesForApps(apps: BuilderAppPresentation[]) {
	const categoryIds = new Set(apps.flatMap((app) => app.categoryIds));

	return listBuilderHomeCategories().filter((category) => categoryIds.has(category.slug));
}

export function createExternalBuilderAppRuntime(env: BuilderRuntimeEnv, fetchImpl: typeof fetch = fetch) {
	const getActiveBuilderAppManifest = async (slug: string) => {
		assertRuntimePresentationCoverage();

		const presentation = getActiveBuilderAppPresentationEntry(slug);

		return presentation && hasRuntimeConfig(slug)
			? await getBuilderAppRegistryEntry(env, fetchImpl, presentation)
			: null;
	};

	const listBuilderHomeApps = async () => {
		assertRuntimePresentationCoverage();

		const appResults = await Promise.allSettled(
			listBuilderHomePresentationEntries()
				.filter((presentation) => hasRuntimeConfig(presentation.slug))
				.map((presentation) => getBuilderAppRegistryEntry(env, fetchImpl, presentation))
		);
		const apps = appResults
			.filter((result) => result.status === 'fulfilled')
			.map((result) => result.value)
			.sort((left, right) => left.sortOrder - right.sortOrder);

		return {
			categories: filterCategoriesForApps(apps),
			apps
		};
	};

	const getBuilderAppRuntime = (slug: string) => {
		assertRuntimePresentationCoverage();

		const presentation = getActiveBuilderAppPresentationEntry(slug);

		if (!presentation || !hasRuntimeConfig(slug)) {
			return null;
		}

		return {
			startTurn: async (input: BuilderAppStartTurnInput) =>
				await callRuntime(env, fetchImpl, slug, 'start-turn', input, relayAssistantDelta(input)),
			continueTurn: async (input: BuilderAppContinueTurnInput) =>
				await callRuntime(env, fetchImpl, slug, 'continue-turn', input, relayAssistantDelta(input)),
			backgroundJob: async (input: BuilderAppBackgroundJobInput) =>
				await callRuntime(env, fetchImpl, slug, 'background-job', input)
		};
	};

	return {
		getActiveBuilderAppManifest,
		listBuilderHomeApps,
		getBuilderAppRuntime
	};
}
