type TranscriptMessage = {
	role: 'user' | 'assistant';
	text: string;
};

type OpenAIResponseContent = {
	type?: string;
	text?: string;
};

type OpenAIResponseOutput = {
	type?: string;
	content?: OpenAIResponseContent[];
};

type OpenAIResponseBody = {
	error?: {
		message?: string;
	};
	output_text?: string;
	output?: OpenAIResponseOutput[];
};

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';
const MAX_OUTPUT_TOKENS = 1_200;

function getOpenAIConfig() {
	const apiKey = process.env.OPENAI_API_KEY;
	const model = process.env.OPENAI_CHAT_MODEL ?? DEFAULT_OPENAI_MODEL;

	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is not configured.');
	}

	return { apiKey, model };
}

function extractOutputText(responseBody: OpenAIResponseBody) {
	if (responseBody.output_text?.trim()) {
		return responseBody.output_text.trim();
	}

	const text = responseBody.output
		?.flatMap((output) => output.content ?? [])
		.filter((content) => content.type === 'output_text' && content.text)
		.map((content) => content.text)
		.join('')
		.trim();

	if (!text) {
		throw new Error('OpenAI returned an empty response.');
	}

	return text;
}

export async function generateChatReply(transcript: TranscriptMessage[]) {
	const { apiKey, model } = getOpenAIConfig();

	const response = await fetch(OPENAI_RESPONSES_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model,
			input: transcript.map((message) => ({
				role: message.role,
				content: message.text
			})),
			max_output_tokens: MAX_OUTPUT_TOKENS,
			store: false
		})
	});

	const responseBody = (await response.json()) as OpenAIResponseBody;

	if (!response.ok) {
		throw new Error(responseBody.error?.message ?? `OpenAI request failed with ${response.status}.`);
	}

	return extractOutputText(responseBody);
}
