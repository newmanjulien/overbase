import {
	BRING_THE_FIRM_APP_SLUG,
	CUSTOM_NOTIFICATION_APP_SLUG,
	getActiveBuilderAppPresentationEntry,
	getBuilderAppPresentationEntry,
	listBuilderHomeCategories,
	listBuilderHomePresentationEntries,
	mergeBuilderAppManifest,
	toBuilderAppGuideEntry,
	type BuilderAppGuideEntry
} from './registry';
import type {
	BuilderAppBackgroundJobInput,
	BuilderAppContinueTurnInput,
	BuilderAppManifest,
	BuilderAppOutputEvent,
	BuilderAppStartTurnInput
} from '@overbase/builder-sdk/app-protocol';
import type { BuilderAppPresentation } from './presentation';

type RuntimeRoute = 'start-turn' | 'continue-turn' | 'background-job';

type RuntimeConfig = {
	urlEnv: string;
	secretEnv: string;
};

type RuntimeInput =
	| BuilderAppStartTurnInput
	| BuilderAppContinueTurnInput
	| BuilderAppBackgroundJobInput;

type RuntimeStreamHandler = (event: BuilderAppOutputEvent) => Promise<void> | void;

const RUNTIME_CONFIGS: Record<string, RuntimeConfig> = {
	[BRING_THE_FIRM_APP_SLUG]: {
		urlEnv: 'BRING_THE_FIRM_RUNTIME_URL',
		secretEnv: 'BRING_THE_FIRM_RUNTIME_SECRET'
	},
	[CUSTOM_NOTIFICATION_APP_SLUG]: {
		urlEnv: 'CUSTOM_NOTIFICATION_RUNTIME_URL',
		secretEnv: 'CUSTOM_NOTIFICATION_RUNTIME_SECRET'
	}
};

function assertRuntimePresentationCoverage() {
	const missingPresentationSlugs = Object.keys(RUNTIME_CONFIGS).filter(
		(slug) => !getBuilderAppPresentationEntry(slug)
	);

	if (missingPresentationSlugs.length > 0) {
		throw new Error(
			`Missing builder app presentation entries for: ${missingPresentationSlugs.join(', ')}.`
		);
	}
}

function getEnvValue(name: string) {
	const value = process.env[name]?.trim();

	if (!value) {
		throw new Error(`Missing ${name}.`);
	}

	return value;
}

function getRuntimeDefinition(appSlug: string) {
	const config = RUNTIME_CONFIGS[appSlug];

	if (!config) {
		throw new Error('This app is unavailable.');
	}

	return config;
}

function getRuntimeBaseUrl(appSlug: string) {
	return getEnvValue(getRuntimeDefinition(appSlug).urlEnv).replace(/\/+$/, '');
}

function getRuntimeConfig(appSlug: string) {
	const config = getRuntimeDefinition(appSlug);

	return {
		baseUrl: getRuntimeBaseUrl(appSlug),
		secret: getEnvValue(config.secretEnv)
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is readonly string[] {
	return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isGuideQuestion(value: unknown) {
	if (!isRecord(value)) {
		return false;
	}

	if (
		value.type === 'choice' &&
		typeof value.id === 'string' &&
		typeof value.title === 'string' &&
		isStringArray(value.options) &&
		typeof value.customAnswerPlaceholder === 'string'
	) {
		return true;
	}

	return (
		value.type === 'text' &&
		typeof value.id === 'string' &&
		typeof value.title === 'string' &&
		typeof value.placeholder === 'string'
	);
}

function isGuideDefinition(value: unknown) {
	return (
		isRecord(value) &&
		typeof value.intro === 'string' &&
		Array.isArray(value.questions) &&
		value.questions.every(isGuideQuestion)
	);
}

function isBuilderAppManifest(value: unknown): value is BuilderAppManifest {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.slug === 'string' &&
		typeof value.title === 'string' &&
		typeof value.description === 'string' &&
		((value.mode === 'custom' && value.guide === null) ||
			(value.mode === 'guided' && isGuideDefinition(value.guide)))
	);
}

async function fetchRuntimeManifest(appSlug: string) {
	const baseUrl = getRuntimeBaseUrl(appSlug);
	const response = await fetch(`${baseUrl}/api/builder/manifest`, {
		headers: {
			accept: 'application/json'
		}
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
}

async function getBuilderAppRegistryEntry(presentation: BuilderAppPresentation) {
	const manifest = await fetchRuntimeManifest(presentation.slug);

	return mergeBuilderAppManifest(manifest, presentation);
}

export async function getActiveBuilderAppManifest(slug: string) {
	assertRuntimePresentationCoverage();

	const presentation = getActiveBuilderAppPresentationEntry(slug);

	return presentation ? await getBuilderAppRegistryEntry(presentation) : null;
}

export async function getBuilderAppGuide(slug: string): Promise<BuilderAppGuideEntry | null> {
	const app = await getActiveBuilderAppManifest(slug);

	return app ? toBuilderAppGuideEntry(app) : null;
}

export async function listBuilderHomeApps() {
	assertRuntimePresentationCoverage();

	const apps = await Promise.all(
		listBuilderHomePresentationEntries().map(getBuilderAppRegistryEntry)
	);

	return {
		categories: listBuilderHomeCategories(),
		apps: apps.sort((left, right) => left.sortOrder - right.sortOrder)
	};
}

async function createSignature(body: string, secret: string, timestamp: string) {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign(
		'HMAC',
		key,
		new TextEncoder().encode(`${timestamp}.${body}`)
	);

	return [...new Uint8Array(signature)]
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}

function stripHandlers<T extends RuntimeInput>(input: T) {
	const body = { ...input } as Record<string, unknown>;
	delete body.handlers;

	return body;
}

async function parseRuntimeEventLine(line: string) {
	try {
		const event = JSON.parse(line) as BuilderAppOutputEvent;

		if (event.type === 'fail') {
			throw new Error(event.errorText);
		}

		return event;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}

		throw new Error('The app runtime returned an invalid event.');
	}
}

async function readRuntimeEvents(response: Response, onEvent?: RuntimeStreamHandler) {
	const events: BuilderAppOutputEvent[] = [];

	if (!response.body) {
		return events;
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';

	while (true) {
		const { done, value } = await reader.read();

		if (done) {
			break;
		}

		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split('\n');
		buffer = lines.pop() ?? '';

		for (const line of lines) {
			const trimmedLine = line.trim();

			if (!trimmedLine) {
				continue;
			}

			const event = await parseRuntimeEventLine(trimmedLine);
			events.push(event);
			await onEvent?.(event);
		}
	}

	buffer += decoder.decode();

	if (buffer.trim()) {
		const event = await parseRuntimeEventLine(buffer.trim());
		events.push(event);
		await onEvent?.(event);
	}

	return events;
}

async function callRuntime(
	appSlug: string,
	route: RuntimeRoute,
	input: RuntimeInput,
	onEvent?: RuntimeStreamHandler
) {
	const { baseUrl, secret } = getRuntimeConfig(appSlug);
	const body = JSON.stringify(stripHandlers(input));
	const timestamp = String(Date.now());
	const signature = await createSignature(body, secret, timestamp);
	const response = await fetch(`${baseUrl}/api/builder/${route}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-overbase-app': appSlug,
			'x-overbase-timestamp': timestamp,
			'x-overbase-signature': signature
		},
		body
	});

	if (!response.ok) {
		const errorText = await response.text();

		throw new Error(errorText.trim() || `The app runtime failed with status ${response.status}.`);
	}

	return await readRuntimeEvents(response, onEvent);
}

function relayAssistantDelta(input: RuntimeInput): RuntimeStreamHandler {
	return async (event) => {
		if (event.type === 'assistantDelta' && 'handlers' in input) {
			await input.handlers?.onAssistantDelta?.(event.text);
		}
	};
}

export function getBuilderAppRuntime(slug: string) {
	assertRuntimePresentationCoverage();

	const presentation = getActiveBuilderAppPresentationEntry(slug);

	if (!presentation || !(slug in RUNTIME_CONFIGS)) {
		return null;
	}

	return {
		startTurn: async (input: BuilderAppStartTurnInput) =>
			await callRuntime(slug, 'start-turn', input, relayAssistantDelta(input)),
		continueTurn: async (input: BuilderAppContinueTurnInput) =>
			await callRuntime(slug, 'continue-turn', input, relayAssistantDelta(input)),
		backgroundJob: async (input: BuilderAppBackgroundJobInput) =>
			await callRuntime(slug, 'background-job', input)
	};
}
