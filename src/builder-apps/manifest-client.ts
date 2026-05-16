import type { BuilderAppManifest } from '@overbase/builder-sdk/app-protocol';
import type { BuilderAppPresentation } from './presentation';
import { isBuilderAppManifest, isRecord } from './manifest-validation';
import { getRuntimeBaseUrl, type BuilderRuntimeEnv } from './runtime-config';
import { mergeBuilderAppManifest } from './registry';

const MANIFEST_FETCH_TIMEOUT_MS = 2_500;
const manifestRequests = new Map<string, Promise<BuilderAppManifest>>();

async function fetchRuntimeManifest(
	fetchImpl: typeof fetch,
	appSlug: string,
	baseUrl: string
) {
	const controller = new AbortController();
	const timeout = setTimeout(() => {
		controller.abort();
	}, MANIFEST_FETCH_TIMEOUT_MS);

	try {
		const response = await fetchImpl(`${baseUrl}/api/builder/manifest`, {
			headers: {
				accept: 'application/json'
			},
			signal: controller.signal
		});

		if (!response.ok) {
			throw new Error(`The app manifest failed with status ${response.status}.`);
		}

		const body = (await response.json()) as unknown;
		const manifest = isRecord(body) ? body.manifest : null;

		if (!isBuilderAppManifest(manifest) || manifest.slug !== appSlug) {
			throw new Error('The app runtime returned an invalid manifest.');
		}

		return manifest;
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') {
			throw new Error('The app manifest timed out.');
		}

		throw error;
	} finally {
		clearTimeout(timeout);
	}
}

function getManifestRequestKey(appSlug: string, baseUrl: string) {
	return `${appSlug}:${baseUrl}`;
}

async function getRuntimeManifest(
	env: BuilderRuntimeEnv,
	fetchImpl: typeof fetch,
	appSlug: string
) {
	const baseUrl = getRuntimeBaseUrl(env, appSlug);
	const requestKey = getManifestRequestKey(appSlug, baseUrl);
	const pendingRequest = manifestRequests.get(requestKey);

	if (pendingRequest) {
		return await pendingRequest;
	}

	const request = fetchRuntimeManifest(fetchImpl, appSlug, baseUrl).finally(() => {
		manifestRequests.delete(requestKey);
	});

	manifestRequests.set(requestKey, request);

	return await request;
}

export async function getBuilderAppRegistryEntry(
	env: BuilderRuntimeEnv,
	fetchImpl: typeof fetch,
	presentation: BuilderAppPresentation
) {
	const manifest = await getRuntimeManifest(env, fetchImpl, presentation.slug);

	return mergeBuilderAppManifest(manifest, presentation);
}
