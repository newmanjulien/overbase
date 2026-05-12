import { env } from '$env/dynamic/private';
import { callStructuredTool, getOpenAIConfig } from '@overbase/builder-sdk/openai';
import type { BusinessResearchRequest, GoToMarketResearchRequest } from './requests';

type ParagraphResult = {
	paragraph: string;
};

const PARAGRAPH_TOOL_PARAMETERS = {
	type: 'object',
	properties: {
		paragraph: {
			type: 'string',
			description: 'One concise, editable paragraph written in plain business language.'
		}
	},
	required: ['paragraph'],
	additionalProperties: false
};

function getOnboardingOpenAIConfig() {
	return getOpenAIConfig({
		profile: 'fast',
		apiKey: env.OPENAI_API_KEY,
		chatModel: env.OPENAI_CHAT_MODEL,
		fastChatModel: env.OPENAI_FAST_CHAT_MODEL,
		reasoningEffort: env.OPENAI_REASONING_EFFORT,
		fastReasoningEffort: env.OPENAI_FAST_REASONING_EFFORT
	});
}

function normalizeParagraph(paragraph: string) {
	return paragraph.replace(/\s+/g, ' ').trim();
}

export async function researchBusinessDescription(input: BusinessResearchRequest) {
	const result = await callStructuredTool<ParagraphResult>({
		openAIConfig: getOnboardingOpenAIConfig(),
		toolName: 'record_business_description',
		toolDescription: 'Record the researched business description.',
		toolParameters: PARAGRAPH_TOOL_PARAMETERS,
		systemPrompt:
			'You help Overbase understand a company during onboarding. Return only grounded, concise business context. Do not mention uncertainty, browsing limits, or internal research process.',
		userPrompt: [
			`Business name: ${input.businessName}`,
			`Company website: ${input.website}`,
			'Write one editable paragraph explaining what this business does, who it serves, and what it appears to sell. Keep it under 90 words.'
		].join('\n')
	});

	return normalizeParagraph(result.paragraph);
}

export async function researchGoToMarketDescription(input: GoToMarketResearchRequest) {
	const result = await callStructuredTool<ParagraphResult>({
		openAIConfig: getOnboardingOpenAIConfig(),
		toolName: 'record_go_to_market_description',
		toolDescription: 'Record the researched go-to-market description.',
		toolParameters: PARAGRAPH_TOOL_PARAMETERS,
		systemPrompt:
			'You help Overbase understand how a company reaches customers. Return only practical go-to-market context. Do not mention uncertainty, browsing limits, or internal research process.',
		userPrompt: [
			`Business name: ${input.businessName}`,
			`Company website: ${input.website}`,
			`Corrected business description: ${input.businessDescription}`,
			'Write one editable paragraph explaining how this business likely goes to market: buyer, sales motion, partner/channel motion, and signals that would matter. Keep it under 100 words.'
		].join('\n')
	});

	return normalizeParagraph(result.paragraph);
}
