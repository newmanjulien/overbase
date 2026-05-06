import {
	applyEmailDraftPatch,
	emailDraftJsonSchema,
	emailDraftPatchJsonSchema,
	normalizeEmailDraft,
	type EmailDraft,
	type EmailDraftPatch
} from './emailArtifact';

type TranscriptMessage = {
	role: 'user' | 'assistant';
	text: string;
};

export type EmailTemplateGroupCandidate = {
	slug: string;
	label: string;
	description: string;
	questionGuidance: string;
};

export type EmailTemplateCandidate = {
	slug: string;
	groupSlug: string;
	label: string;
	description: string;
	matchSignals: string[];
	emailDraft: EmailDraft;
};

export type EmailRouteResult = {
	groupSlug: string;
	question: string;
};

export type EmailAdaptedTemplateResult = {
	templateSlug: string;
	emailDraft: EmailDraft;
};

export type EmailBuilderEventContext = {
	summary: string;
	changedFields: string[];
	createdAt: number;
};

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

type OpenAIResponseBody = {
	output_text?: string;
	output?: Array<{
		type?: string;
		name?: string;
		arguments?: string;
		content?: Array<{
			type?: string;
			text?: string;
		}>;
	}>;
	error?: {
		message?: string;
	};
};

type ChatReplyDeltaHandler = (delta: string) => void | Promise<void>;

type ChatReplyStreamHandlers = {
	onDelta?: ChatReplyDeltaHandler;
};

type EmailBuilderTurnStreamHandlers = {
	onTextDelta?: ChatReplyDeltaHandler;
};

export type EmailBuilderTurnStreamResult = {
	text: string;
	patch: EmailDraftPatch | null;
	patchIntent: 'none' | 'noop' | 'meaningful';
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
const UPDATE_EMAIL_DRAFT_TOOL_NAME = 'update_email_draft';

const EMAIL_ROUTE_TOOL_NAME = 'select_email_template_group';
const EMAIL_ADAPT_TOOL_NAME = 'adapt_email_template';
const EMAIL_INITIAL_ANSWER_TOOL_NAME = 'apply_initial_email_answer';

const EMAIL_BUILDER_REFINEMENT_SYSTEM_PROMPT = [
	'You are Overbase\'s custom email notification builder.',
	'The user is iterating on a visible email notification draft.',
	'Speak in concise plain text. This text is streamed directly into the chat UI.',
	'Change the email draft only by calling update_email_draft. Never describe JSON or patch operations to the user.',
	'Call update_email_draft at most once per turn, only when the visible email draft should change.',
	'When changing the draft, send the smallest patch that achieves the requested change.',
	'The draft fields are to, cc, attachments, body, and fireReason.',
	'fireReason explains exactly why the email notification fires; keep it short and operational.',
	'Attachments are PDF placeholder filenames only. Attachment names must end in .pdf.',
	'Keep the email compact: at most four body blocks, at most five bullets, and roughly 150 visible words.',
	'Do not invent business-critical facts. If required information is missing, ask one focused question in chat text.',
	'When recent internal artifact events are present, treat them as source material for future chat context without mentioning them unless useful.'
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

function getOpenAIHeaders(apiKey: string) {
	return {
		Authorization: `Bearer ${apiKey}`,
		'Content-Type': 'application/json'
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

function parseEmailDraftPatch(argumentsText: string) {
	if (!argumentsText.trim()) {
		throw new Error('OpenAI called update_email_draft without arguments.');
	}

	return JSON.parse(argumentsText) as EmailDraftPatch;
}

async function readEmailBuilderTurnStream(
	response: Response,
	handlers: EmailBuilderTurnStreamHandlers
): Promise<EmailBuilderTurnStreamResult> {
	const toolCalls = new Map<string, ToolCallAccumulator>();
	let streamedText = '';
	let finalText = '';
	let patch: EmailDraftPatch | null = null;

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

	const draftToolCalls = Array.from(toolCalls.values()).filter((toolCall) => {
		if (toolCall.name && toolCall.name !== UPDATE_EMAIL_DRAFT_TOOL_NAME) {
			throw new Error(`OpenAI called an unsupported tool: ${toolCall.name}.`);
		}

		return toolCall.arguments.trim().length > 0;
	});

	if (draftToolCalls.length > 1) {
		throw new Error('OpenAI called update_email_draft more than once.');
	}

	if (draftToolCalls[0]) {
		patch = parseEmailDraftPatch(draftToolCalls[0].arguments);
	}

	const text = finalText || streamedText;

	if (!text.trim() && !patch) {
		throw new Error('OpenAI returned an empty builder response.');
	}

	return {
		text,
		patch,
		patchIntent: patch ? 'meaningful' : 'none'
	};
}

function getFunctionCallArguments(responseBody: OpenAIResponseBody, toolName: string) {
	for (const outputItem of responseBody.output ?? []) {
		if (outputItem.type === 'function_call' && outputItem.name === toolName) {
			if (!outputItem.arguments) {
				throw new Error(`OpenAI called ${toolName} without arguments.`);
			}

			return outputItem.arguments;
		}
	}

	throw new Error(`OpenAI did not call ${toolName}.`);
}

async function callStructuredTool<T>(params: {
	systemPrompt: string;
	userPrompt: string;
	toolName: string;
	toolDescription: string;
	toolParameters: unknown;
}) {
	const { apiKey, model } = getOpenAIConfig();
	const body = {
		model,
		input: [
			{
				role: 'system',
				content: params.systemPrompt
			},
			{
				role: 'user',
				content: params.userPrompt
			}
		],
		tools: [
			{
				type: 'function',
				name: params.toolName,
				description: params.toolDescription,
				parameters: params.toolParameters,
				strict: true
			}
		],
		tool_choice: {
			type: 'function',
			name: params.toolName
		},
		parallel_tool_calls: false,
		...(supportsReasoningOptions(model) ? { reasoning: { effort: 'low' } } : {}),
		max_output_tokens: STRUCTURED_MAX_OUTPUT_TOKENS,
		store: false,
		stream: false
	};

	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: getOpenAIHeaders(apiKey),
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		throw new Error(await getOpenAIErrorMessage(response));
	}

	const responseBody = (await response.json()) as OpenAIResponseBody;

	if (responseBody.error?.message) {
		throw new Error(responseBody.error.message);
	}

	return JSON.parse(getFunctionCallArguments(responseBody, params.toolName)) as T;
}

function stringifyCandidates(candidates: unknown) {
	return JSON.stringify(candidates, null, 2);
}

export async function streamChatReply(
	transcript: TranscriptMessage[],
	handlers: ChatReplyStreamHandlers
) {
	const { apiKey, model } = getOpenAIConfig();

	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: getOpenAIHeaders(apiKey),
		body: JSON.stringify(createChatResponseRequestBody(transcript, model))
	});

	if (!response.ok) {
		throw new Error(await getOpenAIErrorMessage(response));
	}

	return await readOpenAIStream(response, handlers);
}

export async function routeEmailBuilderRequest(params: {
	initialMessage: string;
	groups: EmailTemplateGroupCandidate[];
}) {
	return await callStructuredTool<EmailRouteResult>({
		systemPrompt: [
			'You route a custom email notification request to the closest template group.',
			'Pick exactly one group from the provided list.',
			'Also write the one follow-up question that would resolve the most important uncertainty.',
			'The user must never know templates or groups exist.'
		].join('\n'),
		userPrompt: [
			'User request:',
			params.initialMessage,
			'Available groups:',
			stringifyCandidates(params.groups)
		].join('\n\n'),
		toolName: EMAIL_ROUTE_TOOL_NAME,
		toolDescription: 'Select the closest email template group and the first follow-up question.',
		toolParameters: {
			type: 'object',
			additionalProperties: false,
			properties: {
				groupSlug: {
					type: 'string',
					enum: params.groups.map((group) => group.slug)
				},
				question: {
					type: 'string',
					description: 'One concise question about the least certain important detail.'
				}
			},
			required: ['groupSlug', 'question']
		}
	});
}

export async function streamEmailInitialQuestion(params: {
	initialMessage: string;
	group: EmailTemplateGroupCandidate;
	proposedQuestion: string;
	handlers: ChatReplyStreamHandlers;
}) {
	const { apiKey, model } = getOpenAIConfig();
	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: getOpenAIHeaders(apiKey),
		body: JSON.stringify({
			model,
			input: [
				{
					role: 'system',
					content: [
						'You are Overbase\'s custom email notification builder.',
						'Ask exactly one concise follow-up question.',
						'Do not mention templates, groups, routing, hidden drafts, or internal process.',
						'The question should feel natural and should ask about the least certain important detail.'
					].join('\n')
				},
				{
					role: 'user',
					content: [
						`User request: ${params.initialMessage}`,
						`Question guidance: ${params.group.questionGuidance}`,
						`Proposed question: ${params.proposedQuestion}`
					].join('\n')
				}
			],
			...(supportsReasoningOptions(model) ? { reasoning: { effort: 'low' } } : {}),
			max_output_tokens: 220,
			store: false,
			stream: true
		})
	});

	if (!response.ok) {
		throw new Error(await getOpenAIErrorMessage(response));
	}

	return await readOpenAIStream(response, params.handlers);
}

export async function adaptEmailBuilderTemplate(params: {
	initialMessage: string;
	group: EmailTemplateGroupCandidate;
	templates: EmailTemplateCandidate[];
}) {
	const result = await callStructuredTool<EmailAdaptedTemplateResult>({
		systemPrompt: [
			'You adapt the closest hidden email notification template into a strong first draft.',
			'Pick exactly one template from the provided list.',
			'Adapt the draft to the user request without inventing unsupported business-critical facts.',
			'The draft is hidden until the user answers the first follow-up question.',
			'Keep copy compact and specific. Include a fireReason that explains the trigger.'
		].join('\n'),
		userPrompt: [
			'User request:',
			params.initialMessage,
			'Selected group:',
			stringifyCandidates(params.group),
			'Candidate templates:',
			stringifyCandidates(params.templates)
		].join('\n\n'),
		toolName: EMAIL_ADAPT_TOOL_NAME,
		toolDescription: 'Pick the closest template and return the adapted email draft.',
		toolParameters: {
			type: 'object',
			additionalProperties: false,
			properties: {
				templateSlug: {
					type: 'string',
					enum: params.templates.map((template) => template.slug)
				},
				emailDraft: emailDraftJsonSchema
			},
			required: ['templateSlug', 'emailDraft']
		}
	});

	return {
		...result,
		emailDraft: normalizeEmailDraft(result.emailDraft)
	};
}

export async function applyEmailInitialAnswer(params: {
	initialMessage: string;
	initialQuestion: string;
	initialAnswer: string;
	draft: EmailDraft;
}) {
	const result = await callStructuredTool<{ emailDraft: EmailDraft }>({
		systemPrompt: [
			'You make the first minor adjustment to a hidden email notification draft after the user answers one follow-up question.',
			'Return the complete updated draft.',
			'Preserve useful structure from the draft. Only change fields affected by the answer or obvious fit improvements.',
			'Keep the draft concise and operational.'
		].join('\n'),
		userPrompt: [
			'Original user request:',
			params.initialMessage,
			'Follow-up question:',
			params.initialQuestion,
			'User answer:',
			params.initialAnswer,
			'Hidden draft JSON:',
			JSON.stringify(params.draft, null, 2)
		].join('\n\n'),
		toolName: EMAIL_INITIAL_ANSWER_TOOL_NAME,
		toolDescription: 'Return the hidden email draft after applying the initial answer.',
		toolParameters: {
			type: 'object',
			additionalProperties: false,
			properties: {
				emailDraft: emailDraftJsonSchema
			},
			required: ['emailDraft']
		}
	});

	return normalizeEmailDraft(result.emailDraft);
}

export async function streamCustomEmailBuilderTurn(params: {
	transcript: TranscriptMessage[];
	draft: EmailDraft;
	recentEvents: EmailBuilderEventContext[];
	handlers: EmailBuilderTurnStreamHandlers;
}): Promise<EmailBuilderTurnStreamResult> {
	const { apiKey, model } = getOpenAIConfig();
	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: getOpenAIHeaders(apiKey),
		body: JSON.stringify({
			model,
			input: [
				{
					role: 'system',
					content: EMAIL_BUILDER_REFINEMENT_SYSTEM_PROMPT
				},
				...params.transcript.map((message) => ({
					role: message.role,
					content: message.text
				})),
				{
					role: 'user',
					content: [
						'Current visible email draft JSON:',
						JSON.stringify(params.draft),
						params.recentEvents.length > 0
							? [
									'Recent internal artifact events:',
									JSON.stringify(params.recentEvents)
								].join('\n')
							: 'Recent internal artifact events: []',
						'Respond to the user in normal text. If the draft should change, call update_email_draft.'
					].join('\n')
				}
			],
			tools: [
				{
					type: 'function',
					name: UPDATE_EMAIL_DRAFT_TOOL_NAME,
					description: 'Patch the visible email notification draft.',
					parameters: emailDraftPatchJsonSchema,
					strict: true
				}
			],
			parallel_tool_calls: false,
			...(supportsReasoningOptions(model) ? { reasoning: { effort: 'low' } } : {}),
			max_output_tokens: STRUCTURED_MAX_OUTPUT_TOKENS,
			store: false,
			stream: true
		})
	});

	if (!response.ok) {
		throw new Error(await getOpenAIErrorMessage(response));
	}

	const result = await readEmailBuilderTurnStream(response, params.handlers);
	const meaningfulOperations =
		result.patch?.operations.filter((operation) => {
			const nextDraft = applyEmailDraftPatch(params.draft, { operations: [operation] });
			return JSON.stringify(nextDraft) !== JSON.stringify(normalizeEmailDraft(params.draft));
		}) ?? null;
	const patchIntent = result.patch
		? meaningfulOperations && meaningfulOperations.length > 0
			? 'meaningful'
			: 'noop'
		: 'none';

	return {
		...result,
		patch:
			patchIntent === 'meaningful' && meaningfulOperations
				? {
						operations: meaningfulOperations
					}
				: null,
		patchIntent
	};
}
