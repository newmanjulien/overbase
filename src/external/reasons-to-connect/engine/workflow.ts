import {
	applyEmailDraftPatch,
	emailDraftJsonSchema,
	emailDraftPatchJsonSchema,
	normalizeEmailDraft,
	type EmailDraft
} from '@overbase/builder-sdk/email';
import {
	callStructuredTool,
	getOpenAIConfig,
	getOpenAIErrorMessage,
	getOpenAIHeaders,
	OPENAI_RESPONSES_URL,
	readEmailBuilderTurnStream,
	STRUCTURED_MAX_OUTPUT_TOKENS,
	supportsReasoningOptions,
	type EmailBuilderTurnStreamResult
} from '@overbase/builder-sdk/server';
import type {
	ReasonsToConnectInitialDraftParams,
	ReasonsToConnectRefinementParams
} from './types';
import {
	buildReasonsToConnectInitialDraftPrompt,
	buildReasonsToConnectRefinementSystemPrompt
} from './prompts';

const UPDATE_EMAIL_DRAFT_TOOL_NAME = 'update_email_draft';

async function createEmailDraftFromPrompt(params: {
	systemPrompt: string;
	userPrompt: string;
	toolName: string;
	toolDescription: string;
}) {
	const result = await callStructuredTool<{ emailDraft: EmailDraft }>({
		systemPrompt: params.systemPrompt,
		userPrompt: params.userPrompt,
		toolName: params.toolName,
		toolDescription: params.toolDescription,
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

function buildRefinementUserPrompt(params: {
	draft: EmailDraft;
	recentEvents: ReasonsToConnectRefinementParams['recentEvents'];
}) {
	return [
		'Current visible email draft JSON:',
		JSON.stringify(params.draft),
		params.recentEvents.length > 0
			? ['Recent internal artifact events:', JSON.stringify(params.recentEvents)].join('\n')
			: 'Recent internal artifact events: []',
		'Respond to the user in normal text. If the draft should change, call update_email_draft.'
	].join('\n');
}

async function streamEmailDraftRefinementTurn(params: {
	systemPrompt: string;
	userPrompt: string;
	transcript: ReasonsToConnectRefinementParams['transcript'];
	draft: EmailDraft;
	handlers: ReasonsToConnectRefinementParams['handlers'];
}): Promise<EmailBuilderTurnStreamResult> {
	const { apiKey, model, reasoningEffort } = getOpenAIConfig();
	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: getOpenAIHeaders(apiKey),
		body: JSON.stringify({
			model,
			input: [
				{
					role: 'system',
					content: params.systemPrompt
				},
				...params.transcript.map((message) => ({
					role: message.role,
					content: message.text
				})),
				{
					role: 'user',
					content: params.userPrompt
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
	const normalizedDraft = normalizeEmailDraft(params.draft);
	const meaningfulOperations =
		result.patch?.operations.filter((operation) => {
			const nextDraft = applyEmailDraftPatch(params.draft, { operations: [operation] });
			return JSON.stringify(nextDraft) !== JSON.stringify(normalizedDraft);
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

export async function createReasonsToConnectInitialDraft(params: ReasonsToConnectInitialDraftParams) {
	const prompt = buildReasonsToConnectInitialDraftPrompt(params);

	return await createEmailDraftFromPrompt({
		systemPrompt: prompt.systemPrompt,
		userPrompt: prompt.userPrompt,
		toolName: 'reasons_to_connect_create_email_draft',
		toolDescription: 'Create the Reasons to connect email notification draft.'
	});
}

export async function streamReasonsToConnectRefinementTurn(params: ReasonsToConnectRefinementParams) {
	return await streamEmailDraftRefinementTurn({
		systemPrompt: buildReasonsToConnectRefinementSystemPrompt(),
		userPrompt: buildRefinementUserPrompt({
			draft: params.draft,
			recentEvents: params.recentEvents
		}),
		transcript: params.transcript,
		draft: params.draft,
		handlers: params.handlers
	});
}
