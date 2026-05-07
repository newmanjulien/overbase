export const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
export const STRUCTURED_MAX_OUTPUT_TOKENS = 8_000;
const DEFAULT_OPENAI_MODEL = 'gpt-5.5';
const DEFAULT_OPENAI_FAST_MODEL = 'gpt-5-nano';
const DEFAULT_OPENAI_REASONING_EFFORT = 'medium';
const DEFAULT_OPENAI_FAST_REASONING_EFFORT = 'low';
function isOpenAIReasoningEffort(value) {
    return value === 'minimal' || value === 'low' || value === 'medium' || value === 'high';
}
function getReasoningEffort(value, fallback) {
    return isOpenAIReasoningEffort(value) ? value : fallback;
}
export function getOpenAIConfig(profile = 'default') {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = profile === 'fast'
        ? (process.env.OPENAI_FAST_CHAT_MODEL ?? DEFAULT_OPENAI_FAST_MODEL)
        : (process.env.OPENAI_CHAT_MODEL ?? DEFAULT_OPENAI_MODEL);
    const reasoningEffort = profile === 'fast'
        ? getReasoningEffort(process.env.OPENAI_FAST_REASONING_EFFORT, DEFAULT_OPENAI_FAST_REASONING_EFFORT)
        : getReasoningEffort(process.env.OPENAI_REASONING_EFFORT, DEFAULT_OPENAI_REASONING_EFFORT);
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured.');
    }
    return { apiKey, model, reasoningEffort };
}
export function supportsReasoningOptions(model) {
    return model.startsWith('gpt-5') || model.startsWith('o');
}
export function getOpenAIHeaders(apiKey) {
    return {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };
}
export async function getOpenAIErrorMessage(response) {
    try {
        const responseBody = (await response.json());
        return responseBody.error?.message ?? `OpenAI request failed with ${response.status}.`;
    }
    catch {
        return `OpenAI request failed with ${response.status}.`;
    }
}
function getFunctionCallArguments(responseBody, toolName) {
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
export async function callStructuredTool(params) {
    const { apiKey, model, reasoningEffort } = getOpenAIConfig(params.profile);
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
        ...(supportsReasoningOptions(model) ? { reasoning: { effort: reasoningEffort } } : {}),
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
    const responseBody = (await response.json());
    if (responseBody.error?.message) {
        throw new Error(responseBody.error.message);
    }
    return JSON.parse(getFunctionCallArguments(responseBody, params.toolName));
}
//# sourceMappingURL=openai.js.map