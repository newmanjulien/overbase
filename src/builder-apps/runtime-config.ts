import { BRING_THE_FIRM_APP_SLUG } from './ids';
import { getBuilderAppPresentationEntry } from './registry';

type RuntimeConfig = {
	urlEnv: string;
	secretEnv: string;
};

export type BuilderRuntimeEnv = Record<string, string | undefined>;

const RUNTIME_CONFIGS: Record<string, RuntimeConfig> = {
	[BRING_THE_FIRM_APP_SLUG]: {
		urlEnv: 'BRING_THE_FIRM_RUNTIME_URL',
		secretEnv: 'BRING_THE_FIRM_RUNTIME_SECRET'
	}
};

export function hasRuntimeConfig(appSlug: string) {
	return appSlug in RUNTIME_CONFIGS;
}

export function assertRuntimePresentationCoverage() {
	const missingPresentationSlugs = Object.keys(RUNTIME_CONFIGS).filter(
		(slug) => !getBuilderAppPresentationEntry(slug)
	);

	if (missingPresentationSlugs.length > 0) {
		throw new Error(
			`Missing builder app presentation entries for: ${missingPresentationSlugs.join(', ')}.`
		);
	}
}

function getEnvValue(env: BuilderRuntimeEnv, name: string) {
	const value = env[name]?.trim();

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

export function getRuntimeBaseUrl(env: BuilderRuntimeEnv, appSlug: string) {
	return getEnvValue(env, getRuntimeDefinition(appSlug).urlEnv).replace(/\/+$/, '');
}

export function getRuntimeConfig(env: BuilderRuntimeEnv, appSlug: string) {
	const config = getRuntimeDefinition(appSlug);

	return {
		baseUrl: getRuntimeBaseUrl(env, appSlug),
		secret: getEnvValue(env, config.secretEnv)
	};
}
