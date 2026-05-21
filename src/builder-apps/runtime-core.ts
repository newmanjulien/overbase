import type {
	BuilderAppBackgroundJobInput,
	BuilderAppContinueTurnInput,
	BuilderAppStartTurnInput
} from '@overbase/builder-sdk/app-protocol';
import type { BuilderAppRuntime } from '@overbase/builder-sdk/host';
import { callBuilderRuntime, BUILDER_RUNTIME_ROUTES } from '@overbase/builder-sdk/transport';
import type { BuilderAppPresentation } from './presentation';
import { getBuilderAppRegistryEntry } from './manifest-client';
import {
	getActiveBuilderAppPresentationEntry,
	listBuilderHomeCategories,
	listBuilderHomePresentationEntries
} from './registry';
import {
	assertRuntimePresentationCoverage,
	getRuntimeConfig,
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

	const getBuilderAppRuntime = (slug: string): Omit<BuilderAppRuntime, 'manifest'> | null => {
		assertRuntimePresentationCoverage();

		const presentation = getActiveBuilderAppPresentationEntry(slug);

		if (!presentation || !hasRuntimeConfig(slug)) {
			return null;
		}

		return {
			startTurn: async (input: BuilderAppStartTurnInput, context) => {
				const { baseUrl, secret } = getRuntimeConfig(env, slug);

				return await callBuilderRuntime({
					fetchImpl,
					baseUrl,
					secret,
					appSlug: slug,
					route: BUILDER_RUNTIME_ROUTES.startTurn,
					input,
					onStreamEvent: context.emit
				});
			},
			continueTurn: async (input: BuilderAppContinueTurnInput, context) => {
				const { baseUrl, secret } = getRuntimeConfig(env, slug);

				return await callBuilderRuntime({
					fetchImpl,
					baseUrl,
					secret,
					appSlug: slug,
					route: BUILDER_RUNTIME_ROUTES.continueTurn,
					input,
					onStreamEvent: context.emit
				});
			},
			backgroundJob: async (input: BuilderAppBackgroundJobInput, context) => {
				const { baseUrl, secret } = getRuntimeConfig(env, slug);

				return await callBuilderRuntime({
					fetchImpl,
					baseUrl,
					secret,
					appSlug: slug,
					route: BUILDER_RUNTIME_ROUTES.backgroundJob,
					input,
					onStreamEvent: context.emit
				});
			}
		};
	};

	return {
		getActiveBuilderAppManifest,
		listBuilderHomeApps,
		getBuilderAppRuntime
	};
}
