import type { BuilderAppOutputEvent } from '@overbase/builder-sdk/app-protocol';

export type RuntimeStreamHandler = (event: BuilderAppOutputEvent) => Promise<void> | void;

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

export async function readRuntimeEvents(response: Response, onEvent?: RuntimeStreamHandler) {
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
