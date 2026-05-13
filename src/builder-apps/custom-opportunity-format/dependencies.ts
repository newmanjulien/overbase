import {
	getOpenAIConfig,
	type OpenAIConfig,
	type OpenAIModelProfile
} from '@overbase/builder-sdk/openai';

export type CustomOpportunityFormatRuntimeEnv = Record<string, string | undefined>;

export type CustomOpportunityFormatRuntimeDependencies = {
	getOpenAIConfig: (profile?: OpenAIModelProfile) => OpenAIConfig;
};

export function createCustomOpportunityFormatRuntimeDependencies(
	env: CustomOpportunityFormatRuntimeEnv
): CustomOpportunityFormatRuntimeDependencies {
	return {
		getOpenAIConfig(profile = 'default') {
			return getOpenAIConfig({
				profile,
				apiKey: env.OPENAI_API_KEY,
				chatModel: env.OPENAI_CHAT_MODEL,
				fastChatModel: env.OPENAI_FAST_CHAT_MODEL,
				reasoningEffort: env.OPENAI_REASONING_EFFORT,
				fastReasoningEffort: env.OPENAI_FAST_REASONING_EFFORT
			});
		}
	};
}
