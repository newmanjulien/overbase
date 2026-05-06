type TranscriptMessage = {
	role: 'user' | 'assistant';
	text: string;
};

import {
	emailPreviewUpdateJsonSchema,
	type EmailPreviewUpdate,
	type EmailDraft
} from './emailArtifact';

type OpenAIErrorResponse = {
	error?: {
		message?: string;
	};
};

type OpenAIStreamEvent = {
	type?: string;
	delta?: string;
	text?: string;
	arguments?: string;
	name?: string;
	output_index?: number;
	item_id?: string;
	item?: {
		id?: string;
		type?: string;
		name?: string;
		arguments?: string;
	};
	error?: {
		message?: string;
	};
	response?: {
		status?: string;
		incomplete_details?: {
			reason?: string;
		} | null;
		error?: {
			message?: string;
		};
	};
};

type ChatReplyDeltaHandler = (delta: string) => void | Promise<void>;

type ChatReplyStreamHandlers = {
	onDelta?: ChatReplyDeltaHandler;
};

type BuilderTurnStreamHandlers = {
	onTextDelta?: ChatReplyDeltaHandler;
};

type BuilderTurnStreamResult = {
	text: string;
	previewUpdate: EmailPreviewUpdate | null;
};

type ToolCallAccumulator = {
	name: string | null;
	arguments: string;
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
const STRUCTURED_MAX_OUTPUT_TOKENS = 8_000;
const UPDATE_EMAIL_PREVIEW_TOOL_NAME = 'update_email_preview';

const EMAIL_BUILDER_SYSTEM_PROMPT = [
	'You are Overbase\'s email notification builder.',
	'Speak to the user in concise plain text. This text is streamed directly into the chat UI.',
	'Ask exactly one focused follow-up question at a time unless the preview is ready or you can make a useful update.',
	'Change the email preview only by calling update_email_preview. Never describe JSON, tool arguments, or patch operations to the user.',
	'Call update_email_preview at most once per turn, only when the preview should contain actual notification email content.',
	'If the user request is too vague to draft real email content, ask one follow-up question in chat text and do not call update_email_preview.',
	'Never put assistant questions, setup guidance, or conversational text inside the email preview body.',
	'When you call update_email_preview, send the smallest patch that achieves the visible preview change.',
	'The tool payload must use the current artifact version as baseArtifactVersion.',
	'The preview artifact has only these fields: to, cc, attachments, and body.',
	'The artifact has no subject or heading field between recipients and attachments.',
	'Attachments are PDF placeholder filenames only. You may add or remove attachment filenames when the user asks. Attachment names must end in .pdf.',
	'Body content may use paragraphs, bullet lists, and links. Prefer concise real email copy over placeholders when the user has supplied enough context.',
	'Keep the preview compact: at most four body blocks, at most five bullets, and roughly 150 visible words.',
	'Do not write full reports, repeated sections, long tables, or historical transcript summaries into the preview.',
	'When the user says they edited the email draft, treat the current draft JSON as source material and only fix typos, formatting, and light wording. Preserve meaning, recipients, attachments, links, claims, cadence, and all business-critical facts.',
	'Do not invent business-critical facts. If required information is missing, ask the next best question in the chat text.',
	'The required information is: goal, trigger, recipient, data sources, cadence, body content, PDF attachments if needed, and any relevant links or next steps.',
	'Use status "collecting" while key requirements are unknown, "drafting" once the email preview is useful but incomplete, and "ready" only when the email preview is coherent.'
].join('\n');

function getOpenAIConfig() {
	const apiKey = process.env.OPENAI_API_KEY;
	const model = process.env.OPENAI_CHAT_MODEL ?? DEFAULT_OPENAI_MODEL;

	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not configured.');
	}

	return { apiKey, model };
}

function supportsReasoningOptions(model: string) {
	return model.startsWith('gpt-5') || model.startsWith('o');
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
				content: EMAIL_BUILDER_SYSTEM_PROMPT
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
					'Respond to the user in normal text. If the email preview should change, call update_email_preview with baseArtifactVersion equal to the current artifact version.'
				].join('\n')
			}
		],
		tools: [
			{
				type: 'function',
				name: UPDATE_EMAIL_PREVIEW_TOOL_NAME,
				description: 'Commit a versioned patch to the Outlook-style email preview artifact.',
				parameters: emailPreviewUpdateJsonSchema,
				strict: true
			}
		],
		parallel_tool_calls: false,
		...(supportsReasoningOptions(model) ? { reasoning: { effort: 'low' } } : {}),
		max_output_tokens: STRUCTURED_MAX_OUTPUT_TOKENS,
		store: false,
		stream: true
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

function getStreamErrorMessage(event: OpenAIStreamEvent) {
	return event.error?.message ?? event.response?.error?.message;
}

function throwIfStreamFailed(event: OpenAIStreamEvent) {
	const errorMessage = getStreamErrorMessage(event);

	if (event.type === 'error' || event.type === 'response.failed' || errorMessage) {
		throw new Error(errorMessage ?? 'OpenAI stream failed.');
	}

	if (event.type === 'response.incomplete' || event.response?.status === 'incomplete') {
		const reason = event.response?.incomplete_details?.reason ?? 'unknown';
		throw new Error(`OpenAI response was incomplete: ${reason}.`);
	}
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

	throwIfStreamFailed(event);

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

async function readSseResponse(
	response: Response,
	onEvent: (event: OpenAIStreamEvent) => Promise<void>
) {
	const reader = response.body?.getReader();

	if (!reader) {
		throw new Error('OpenAI returned an empty stream.');
	}

	const decoder = new TextDecoder();
	let buffer = '';

	async function processCompleteChunks() {
		const chunks = buffer.split(/\r?\n\r?\n/);
		buffer = chunks.pop() ?? '';

		for (const chunk of chunks) {
			await processSseChunk(chunk, onEvent);
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
			await processSseChunk(buffer, onEvent);
		}
	} finally {
		reader.releaseLock();
	}
}

async function readOpenAIStream(response: Response, handlers: ChatReplyStreamHandlers) {
	let streamedText = '';
	let finalText = '';

	await readSseResponse(response, async (event) => {
		const parsed = parseStreamEvent(event);

		if (parsed.type === 'delta') {
			streamedText += parsed.text;
			await handlers.onDelta?.(parsed.text);
			return;
		}

		if (parsed.type === 'done') {
			finalText = parsed.text;
		}
	});

	const text = finalText || streamedText;

	if (!text.trim()) {
		throw new Error('OpenAI returned an empty response.');
	}

	return text;
}

function getToolCallKey(event: OpenAIStreamEvent) {
	if (typeof event.item_id === 'string') {
		return event.item_id;
	}

	if (event.item?.id) {
		return event.item.id;
	}

	if (typeof event.output_index === 'number') {
		return `output:${event.output_index}`;
	}

	return 'output:0';
}

function getOrCreateToolCall(
	toolCalls: Map<string, ToolCallAccumulator>,
	event: OpenAIStreamEvent
) {
	const key = getToolCallKey(event);
	const existing = toolCalls.get(key);

	if (existing) {
		const name = event.item?.name ?? event.name;

		if (!existing.name && name) {
			existing.name = name;
		}

		return existing;
	}

	const toolCall: ToolCallAccumulator = {
		name: event.item?.name ?? event.name ?? null,
		arguments: event.item?.arguments ?? ''
	};

	toolCalls.set(key, toolCall);
	return toolCall;
}

function parseEmailPreviewUpdate(argumentsText: string) {
	if (!argumentsText.trim()) {
		throw new Error('OpenAI called update_email_preview without arguments.');
	}

	return JSON.parse(argumentsText) as EmailPreviewUpdate;
}

async function readBuilderTurnStream(
	response: Response,
	handlers: BuilderTurnStreamHandlers
): Promise<BuilderTurnStreamResult> {
	const toolCalls = new Map<string, ToolCallAccumulator>();
	let streamedText = '';
	let finalText = '';
	let previewUpdate: EmailPreviewUpdate | null = null;

	await readSseResponse(response, async (event) => {
		throwIfStreamFailed(event);

		if (event.type === 'response.output_text.delta' && typeof event.delta === 'string') {
			streamedText += event.delta;
			await handlers.onTextDelta?.(event.delta);
			return;
		}

		if (event.type === 'response.output_text.done' && typeof event.text === 'string') {
			finalText = event.text;
			return;
		}

		if (event.type === 'response.output_item.added' && event.item?.type === 'function_call') {
			getOrCreateToolCall(toolCalls, event);
			return;
		}

		if (event.type === 'response.output_item.done' && event.item?.type === 'function_call') {
			const toolCall = getOrCreateToolCall(toolCalls, event);
			toolCall.name = event.item.name ?? toolCall.name;
			toolCall.arguments = event.item.arguments ?? toolCall.arguments;
			return;
		}

		if (
			event.type === 'response.function_call_arguments.delta' &&
			typeof event.delta === 'string'
		) {
			getOrCreateToolCall(toolCalls, event).arguments += event.delta;
			return;
		}

		if (event.type === 'response.function_call_arguments.done') {
			const toolCall = getOrCreateToolCall(toolCalls, event);
			toolCall.name = event.item?.name ?? event.name ?? toolCall.name;
			toolCall.arguments = event.item?.arguments ?? event.arguments ?? toolCall.arguments;
		}
	});

	const previewToolCalls = Array.from(toolCalls.values()).filter((toolCall) => {
		if (toolCall.name && toolCall.name !== UPDATE_EMAIL_PREVIEW_TOOL_NAME) {
			throw new Error(`OpenAI called an unsupported tool: ${toolCall.name}.`);
		}

		return toolCall.arguments.trim().length > 0;
	});

	if (previewToolCalls.length > 1) {
		throw new Error('OpenAI called update_email_preview more than once.');
	}

	if (previewToolCalls[0]) {
		previewUpdate = parseEmailPreviewUpdate(previewToolCalls[0].arguments);
	}

	const text = finalText || streamedText;

	if (!text.trim() && !previewUpdate) {
		throw new Error('OpenAI returned an empty builder response.');
	}

	return {
		text,
		previewUpdate
	};
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

export async function streamBuilderTurn(params: {
	transcript: TranscriptMessage[];
	draft: EmailDraft;
	artifactVersion: number;
	handlers: BuilderTurnStreamHandlers;
}): Promise<BuilderTurnStreamResult> {
	const { apiKey, model } = getOpenAIConfig();
	const { handlers, ...requestParams } = params;

	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(createBuilderTurnRequestBody({ ...requestParams, model }))
	});

	if (!response.ok) {
		throw new Error(await getOpenAIErrorMessage(response));
	}

	return await readBuilderTurnStream(response, handlers);
}
