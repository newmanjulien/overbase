import {
	applyEmailDraftPatch,
	emailDraftJsonSchema,
	emailDraftPatchJsonSchema,
	normalizeEmailDraft,
	type EmailDraft
} from '../../shared/email';
import {
	callStructuredTool,
	createChatResponseRequestBody,
	getOpenAIConfig,
	getOpenAIErrorMessage,
	getOpenAIHeaders,
	OPENAI_RESPONSES_URL,
	STRUCTURED_MAX_OUTPUT_TOKENS,
	supportsReasoningOptions
} from './openai';
import {
	buildEmailExampleAdaptationPrompt,
	buildEmailInitialAnswerPrompt,
	buildEmailInitialQuestionPrompt,
	buildEmailRefinementSystemPrompt,
	buildEmailRefinementUserPrompt,
	buildEmailRoutingPrompt
} from './prompts';
import { readEmailBuilderTurnStream, readOpenAIStream } from './streams';
import type {
	ChatReplyStreamHandlers,
	EmailAdaptedExampleResult,
	EmailBuilderEventContext,
	EmailBuilderTurnStreamHandlers,
	EmailBuilderTurnStreamResult,
	EmailExampleCandidate,
	EmailExamplesCandidate,
	EmailRouteResult,
	TranscriptMessage
} from './types';

const INITIAL_QUESTION_MAX_OUTPUT_TOKENS = 300;
const UPDATE_EMAIL_DRAFT_TOOL_NAME = 'update_email_draft';
const EMAIL_ROUTE_TOOL_NAME = 'select_email_examples';
const EMAIL_ADAPT_TOOL_NAME = 'adapt_email_example';
const EMAIL_INITIAL_ANSWER_TOOL_NAME = 'apply_initial_email_answer';

export async function streamChatReply(
	transcript: TranscriptMessage[],
	handlers: ChatReplyStreamHandlers
) {
	const { apiKey, model, reasoningEffort } = getOpenAIConfig();

	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: getOpenAIHeaders(apiKey),
		body: JSON.stringify(createChatResponseRequestBody(transcript, model, reasoningEffort))
	});

	if (!response.ok) {
		throw new Error(await getOpenAIErrorMessage(response));
	}

	return await readOpenAIStream(response, handlers);
}

export async function routeEmailBuilderRequest(params: {
	initialMessage: string;
	examples: EmailExamplesCandidate[];
}) {
	const prompt = buildEmailRoutingPrompt(params);

	return await callStructuredTool<EmailRouteResult>({
		profile: 'fast',
		systemPrompt: prompt.systemPrompt,
		userPrompt: prompt.userPrompt,
		toolName: EMAIL_ROUTE_TOOL_NAME,
		toolDescription: 'Select the closest email examples set and the first follow-up question.',
		toolParameters: {
			type: 'object',
			additionalProperties: false,
			properties: {
				examplesSlug: {
					type: 'string',
					enum: params.examples.map((examplesSet) => examplesSet.slug)
				},
				question: {
					type: 'string',
					description: 'One concise question about the least certain important detail.'
				}
			},
			required: ['examplesSlug', 'question']
		}
	});
}

export async function streamEmailInitialQuestion(params: {
	initialMessage: string;
	examples: EmailExamplesCandidate;
	proposedQuestion: string;
	handlers: ChatReplyStreamHandlers;
}) {
	const { apiKey, model, reasoningEffort } = getOpenAIConfig('fast');
	const prompt = buildEmailInitialQuestionPrompt(params);
	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: getOpenAIHeaders(apiKey),
		body: JSON.stringify({
			model,
			input: [
				{
					role: 'system',
					content: prompt.systemPrompt
				},
				{
					role: 'user',
					content: prompt.userPrompt
				}
			],
			...(supportsReasoningOptions(model) ? { reasoning: { effort: reasoningEffort } } : {}),
			max_output_tokens: INITIAL_QUESTION_MAX_OUTPUT_TOKENS,
			store: false,
			stream: true
		})
	});

	if (!response.ok) {
		throw new Error(await getOpenAIErrorMessage(response));
	}

	return await readOpenAIStream(response, params.handlers);
}

export async function adaptEmailExample(params: {
	initialMessage: string;
	examples: EmailExamplesCandidate;
	draftExamples: EmailExampleCandidate[];
}) {
	const prompt = buildEmailExampleAdaptationPrompt(params);
	const result = await callStructuredTool<EmailAdaptedExampleResult>({
		systemPrompt: prompt.systemPrompt,
		userPrompt: prompt.userPrompt,
		toolName: EMAIL_ADAPT_TOOL_NAME,
		toolDescription: 'Pick the closest example and return the adapted email draft.',
		toolParameters: {
			type: 'object',
			additionalProperties: false,
			properties: {
				exampleSlug: {
					type: 'string',
					enum: params.draftExamples.map((example) => example.slug)
				},
				emailDraft: emailDraftJsonSchema
			},
			required: ['exampleSlug', 'emailDraft']
		}
	});
	const selectedExample =
		params.draftExamples.find((example) => example.slug === result.exampleSlug) ??
		params.draftExamples[0];

	if (!selectedExample) {
		throw new Error('No email examples are available to adapt.');
	}

	return {
		...result,
		exampleSlug: selectedExample.slug,
		emailDraft: normalizeEmailDraft(result.emailDraft)
	};
}

export async function applyEmailInitialAnswer(params: {
	initialMessage: string;
	initialQuestion: string;
	initialAnswer: string;
	draft: EmailDraft;
}) {
	const prompt = buildEmailInitialAnswerPrompt(params);
	const result = await callStructuredTool<{ emailDraft: EmailDraft }>({
		systemPrompt: prompt.systemPrompt,
		userPrompt: prompt.userPrompt,
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
	const { apiKey, model, reasoningEffort } = getOpenAIConfig();
	const refinementSystemPrompt = buildEmailRefinementSystemPrompt();
	const refinementUserPrompt = buildEmailRefinementUserPrompt({
		draft: params.draft,
		recentEvents: params.recentEvents
	});
	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: getOpenAIHeaders(apiKey),
		body: JSON.stringify({
			model,
			input: [
				{
					role: 'system',
					content: refinementSystemPrompt
				},
				...params.transcript.map((message) => ({
					role: message.role,
					content: message.text
				})),
				{
					role: 'user',
					content: refinementUserPrompt
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
			...(supportsReasoningOptions(model) ? { reasoning: { effort: reasoningEffort } } : {}),
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
