import type {
	BuilderAppBackgroundJobInput,
	BuilderAppContinueTurnInput,
	BuilderAppOutputEvent,
	BuilderAppStartTurnInput
} from '@overbase/builder-sdk/app-protocol';
import { getRuntimeConfig, type BuilderRuntimeEnv } from './runtime-config';
import { readRuntimeEvents, type RuntimeStreamHandler } from './runtime-events';
import { createRuntimeSignature } from './runtime-signing';

export type RuntimeRoute = 'start-turn' | 'continue-turn' | 'background-job';

export type RuntimeInput =
	| BuilderAppStartTurnInput
	| BuilderAppContinueTurnInput
	| BuilderAppBackgroundJobInput;

function stripHandlers<T extends RuntimeInput>(input: T) {
	const body = { ...input } as Record<string, unknown>;
	delete body.handlers;

	return body;
}

export async function callRuntime(
	env: BuilderRuntimeEnv,
	fetchImpl: typeof fetch,
	appSlug: string,
	route: RuntimeRoute,
	input: RuntimeInput,
	onEvent?: RuntimeStreamHandler
) {
	const { baseUrl, secret } = getRuntimeConfig(env, appSlug);
	const body = JSON.stringify(stripHandlers(input));
	const timestamp = String(Date.now());
	const signature = await createRuntimeSignature(body, secret, timestamp);
	const response = await fetchImpl(`${baseUrl}/api/builder/${route}`, {
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

export function relayAssistantDelta(input: RuntimeInput): RuntimeStreamHandler {
	return async (event: BuilderAppOutputEvent) => {
		if (event.type === 'assistantDelta' && 'handlers' in input) {
			await input.handlers?.onAssistantDelta?.(event.text);
		}
	};
}
