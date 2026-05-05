type TranscriptMessage = {
	role: 'user' | 'assistant';
	text: string;
};

import {
	builderTurnResultJsonSchema,
	type BuilderTurnResult,
	type EmailDraft
} from './builderEmailContract';

type OpenAIErrorResponse = {
	error?: {
		message?: string;
	};
};

type OpenAIStreamEvent = {
	type?: string;
	delta?: string;
	text?: string;
	error?: {
		message?: string;
	};
	response?: {
		error?: {
			message?: string;
		};
	};
};

type ChatReplyDeltaHandler = (delta: string) => void | Promise<void>;

type ChatReplyStreamHandlers = {
	onDelta?: ChatReplyDeltaHandler;
};

type ParsedStreamEvent =
	| {
			type: 'delta';
			text: string;
	  }
	| {
			type: 'done';
			text: string;
	  }
	| {
			type: 'ignored';
	  };

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';
const MAX_OUTPUT_TOKENS = 1_200;
const STRUCTURED_MAX_OUTPUT_TOKENS = 2_400;

const CUSTOM_BUILDER_SYSTEM_PROMPT = [
	'You are building a structured email notification UI for Overbase.',
	'The user is describing an email notification they want to receive.',
	'Ask exactly one focused follow-up question at a time unless the draft is ready.',
	'Update the email UI only through the provided patch operations.',
	'Keep drafts practical and readable. Prefer concise real email copy over placeholders when the user has supplied enough context.',
	'Do not invent business-critical facts. If required information is missing, ask the next best question.',
	'The required information is: goal, trigger, recipient, data sources, cadence, subject, preview text, body sections, and recommended action.',
	'Use status "collecting" while key requirements are unknown, "drafting" once the email shape is useful but incomplete, and "ready" only when the email UI is coherent.',
	'Return JSON that matches the schema.'
].join('\n');

function getOpenAIConfig() {
	const apiKey = process.env.OPENAI_API_KEY;
	const model = process.env.OPENAI_CHAT_MODEL ?? DEFAULT_OPENAI_MODEL;

	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not configured.');
	}

	return { apiKey, model };
}

function createChatResponseRequestBody(transcript: TranscriptMessage[], model: string) {
	return {
		model,
		input: transcript.map((message) => ({
			role: message.role,
			content: message.text
		})),
		max_output_tokens: MAX_OUTPUT_TOKENS,
		store: false,
		stream: true
	};
}

function createBuilderTurnRequestBody(params: {
	transcript: TranscriptMessage[];
	draft: EmailDraft;
	artifactVersion: number;
	model: string;
}) {
	const { transcript, draft, artifactVersion, model } = params;

	return {
		model,
		input: [
			{
				role: 'system',
				content: CUSTOM_BUILDER_SYSTEM_PROMPT
			},
			...transcript.map((message) => ({
				role: message.role,
				content: message.text
			})),
			{
				role: 'user',
				content: [
					`Current artifact version: ${artifactVersion}`,
					'Current structured email draft JSON:',
					JSON.stringify(draft),
					'Return the next builder turn result as JSON. baseArtifactVersion must equal the current artifact version.'
				].join('\n')
			}
		],
		text: {
			format: {
				type: 'json_schema',
				name: 'builder_turn_result',
				description: 'The assistant reply plus a versioned constrained patch for the email UI draft.',
				strict: true,
				schema: builderTurnResultJsonSchema
			}
		},
		max_output_tokens: STRUCTURED_MAX_OUTPUT_TOKENS,
		store: false
	};
}

async function getOpenAIErrorMessage(response: Response) {
	try {
		const responseBody = (await response.json()) as OpenAIErrorResponse;
		return responseBody.error?.message ?? `OpenAI request failed with ${response.status}.`;
	} catch {
		return `OpenAI request failed with ${response.status}.`;
	}
}

function getResponseOutputText(responseBody: unknown) {
	if (!responseBody || typeof responseBody !== 'object') {
		return null;
	}

	const body = responseBody as {
		output_text?: unknown;
		output?: unknown;
	};

	if (typeof body.output_text === 'string') {
		return body.output_text;
	}

	if (!Array.isArray(body.output)) {
		return null;
	}

	for (const outputItem of body.output) {
		if (!outputItem || typeof outputItem !== 'object') {
			continue;
		}

		const content = (outputItem as { content?: unknown }).content;

		if (!Array.isArray(content)) {
			continue;
		}

		for (const contentItem of content) {
			if (!contentItem || typeof contentItem !== 'object') {
				continue;
			}

			const text = (contentItem as { text?: unknown }).text;

			if (typeof text === 'string') {
				return text;
			}
		}
	}

	return null;
}

function parseStreamEvent(event: OpenAIStreamEvent): ParsedStreamEvent {
	if (event.type === 'response.output_text.delta' && typeof event.delta === 'string') {
		return {
			type: 'delta',
			text: event.delta
		};
	}

	if (event.type === 'response.output_text.done' && typeof event.text === 'string') {
		return {
			type: 'done',
			text: event.text
		};
	}

	const errorMessage = event.error?.message ?? event.response?.error?.message;

	if (event.type === 'error' || event.type === 'response.failed' || errorMessage) {
		throw new Error(errorMessage ?? 'OpenAI stream failed.');
	}

	return {
		type: 'ignored'
	};
}

async function processSseChunk(
	chunk: string,
	onEvent: (event: OpenAIStreamEvent) => Promise<void>
) {
	const dataLines = chunk
		.split('\n')
		.map((line) => line.trimEnd())
		.filter((line) => line.startsWith('data:'))
		.map((line) => line.slice('data:'.length).trimStart());

	if (dataLines.length === 0) {
		return;
	}

	const data = dataLines.join('\n');

	if (data === '[DONE]') {
		return;
	}

	await onEvent(JSON.parse(data) as OpenAIStreamEvent);
}

async function readOpenAIStream(response: Response, handlers: ChatReplyStreamHandlers) {
	const reader = response.body?.getReader();

	if (!reader) {
		throw new Error('OpenAI returned an empty stream.');
	}

	const decoder = new TextDecoder();
	let buffer = '';
	let streamedText = '';
	let finalText = '';

	async function handleEvent(event: OpenAIStreamEvent) {
		const parsed = parseStreamEvent(event);

		if (parsed.type === 'delta') {
			streamedText += parsed.text;
			await handlers.onDelta?.(parsed.text);
			return;
		}

		if (parsed.type === 'done') {
			finalText = parsed.text;
		}
	}

	async function processCompleteChunks() {
		const chunks = buffer.split(/\r?\n\r?\n/);
		buffer = chunks.pop() ?? '';

		for (const chunk of chunks) {
			await processSseChunk(chunk, handleEvent);
		}
	}

	try {
		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				break;
			}

			buffer += decoder.decode(value, { stream: true });
			await processCompleteChunks();
		}

		buffer += decoder.decode();

		if (buffer.trim()) {
			await processSseChunk(buffer, handleEvent);
		}
	} finally {
		reader.releaseLock();
	}

	const text = finalText || streamedText;

	if (!text.trim()) {
		throw new Error('OpenAI returned an empty response.');
	}

	return text;
}

export async function streamChatReply(
	transcript: TranscriptMessage[],
	handlers: ChatReplyStreamHandlers
) {
	const { apiKey, model } = getOpenAIConfig();

	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(createChatResponseRequestBody(transcript, model))
	});

	if (!response.ok) {
		throw new Error(await getOpenAIErrorMessage(response));
	}

	return await readOpenAIStream(response, handlers);
}

export async function generateBuilderTurnResult(params: {
	transcript: TranscriptMessage[];
	draft: EmailDraft;
	artifactVersion: number;
}): Promise<BuilderTurnResult> {
	const { apiKey, model } = getOpenAIConfig();

	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(createBuilderTurnRequestBody({ ...params, model }))
	});

	if (!response.ok) {
		throw new Error(await getOpenAIErrorMessage(response));
	}

	const responseBody = await response.json();
	const text = getResponseOutputText(responseBody);

	if (!text) {
		throw new Error('OpenAI returned an empty structured response.');
	}

	return JSON.parse(text) as BuilderTurnResult;
}
