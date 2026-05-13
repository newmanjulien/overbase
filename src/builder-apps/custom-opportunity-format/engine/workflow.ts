import {
	applyEmailDraftPatch,
	emailDraftJsonSchema,
	emailDraftPatchJsonSchema,
	hasEmailDraftPatchFields,
	normalizeEmailDraft,
	type EmailDraft
} from '@overbase/builder-sdk/email';
import {
	callStructuredTool,
	getOpenAIErrorMessage,
	getOpenAIHeaders,
	OPENAI_RESPONSES_URL,
	STRUCTURED_MAX_OUTPUT_TOKENS,
	supportsReasoningOptions,
	type OpenAIConfig
} from '@overbase/builder-sdk/openai';
import {
	buildEmailExampleAdaptationPrompt,
	buildEmailInitialAnswerPrompt,
	buildEmailRefinementSystemPrompt,
	buildEmailRefinementUserPrompt,
	buildEmailRoutingPrompt
} from './prompts';
import { readEmailBuilderTurnStream } from '@overbase/builder-sdk/streams';
import type {
	CustomEmailAiContext,
	EmailAdaptedExampleResult,
	EmailBuilderTurnStreamHandlers,
	EmailBuilderTurnStreamResult,
	EmailExampleCandidate,
	EmailExamplesCandidate,
	EmailRouteResult,
	TranscriptMessage
} from '../types';

const UPDATE_EMAIL_DRAFT_TOOL_NAME = 'update_email_draft';
const EMAIL_ROUTE_TOOL_NAME = 'select_email_examples';
const EMAIL_ADAPT_TOOL_NAME = 'adapt_email_example';
const EMAIL_INITIAL_ANSWER_TOOL_NAME = 'apply_initial_email_answer';

/**
 * This is the first step after a user starts a custom opportunity format.
 * The user has typed what they want, and this asks OpenAI to choose which
 * example set best matches that request and what single follow-up question
 * should be asked before drafting.
 */
export async function routeEmailBuilderRequest(params: {
	setupPromptText: string;
	examples: EmailExamplesCandidate[];
	aiContext?: CustomEmailAiContext;
	openAIConfig: OpenAIConfig;
}) {
	const prompt = buildEmailRoutingPrompt(params);

	return await callStructuredTool<EmailRouteResult>({
		openAIConfig: params.openAIConfig,
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
				publicQuestion: {
					type: 'string',
					description:
						'The exact one-sentence public follow-up question to show the user, following the selected examples set questionGuidance.'
				}
			},
			required: ['examplesSlug', 'publicQuestion']
		}
	});
}

/**
 * This prepares the first draft in the background while the user is answering
 * the first follow-up question. It picks the closest concrete draft example,
 * rewrites that example around the user's original request, and returns a
 * normalized email draft that stays hidden until the answer is applied.
 */
export async function adaptEmailExample(params: {
	setupPromptText: string;
	examples: EmailExamplesCandidate;
	draftExamples: EmailExampleCandidate[];
	aiContext?: CustomEmailAiContext;
	openAIConfig: OpenAIConfig;
}) {
	const prompt = buildEmailExampleAdaptationPrompt(params);
	const result = await callStructuredTool<EmailAdaptedExampleResult>({
		openAIConfig: params.openAIConfig,
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

/**
 * This runs after the user answers the first follow-up question.
 * The hidden draft already exists, so this asks OpenAI to fold the user's new
 * answer into that draft and returns the version that will be shown in the
 * builder panel.
 */
export async function applyEmailInitialAnswer(params: {
	setupPromptText: string;
	initialQuestion: string;
	initialAnswer: string;
	draft: EmailDraft;
	aiContext?: CustomEmailAiContext;
	openAIConfig: OpenAIConfig;
}) {
	const prompt = buildEmailInitialAnswerPrompt(params);
	const result = await callStructuredTool<{ emailDraft: EmailDraft }>({
		openAIConfig: params.openAIConfig,
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

/**
 * This handles every later message after the draft is visible.
 * It sends OpenAI the recent conversation and current draft. OpenAI can stream
 * a text reply, ask to patch the draft, or do both. Before returning, this
 * removes any patch that would not actually change the current normalized draft.
 */
export async function streamCustomEmailBuilderTurn(params: {
	transcript: TranscriptMessage[];
	draft: EmailDraft;
	aiContext?: CustomEmailAiContext;
	handlers: EmailBuilderTurnStreamHandlers;
	openAIConfig: OpenAIConfig;
}): Promise<EmailBuilderTurnStreamResult> {
	const { apiKey, model, reasoningEffort } = params.openAIConfig;
	const refinementSystemPrompt = buildEmailRefinementSystemPrompt();
	const refinementUserPrompt = buildEmailRefinementUserPrompt({
		draft: params.draft,
		aiContext: params.aiContext
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
					description: 'Patch the visible opportunity format email draft.',
					parameters: emailDraftPatchJsonSchema
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
	const normalizedDraft = normalizeEmailDraft(params.draft);
	const nextDraft = hasEmailDraftPatchFields(result.patch)
		? applyEmailDraftPatch(params.draft, result.patch)
		: null;
	const patchChanged = nextDraft
		? JSON.stringify(nextDraft) !== JSON.stringify(normalizedDraft)
		: false;

	return {
		...result,
		patch: patchChanged ? result.patch : null
	};
}
