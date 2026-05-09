import {
	getOpenAIConfig,
	type OpenAIConfig,
	type OpenAIModelProfile
} from '@overbase/builder-sdk/openai';

export type CustomNotificationRuntimeEnv = Record<string, string | undefined>;

export type CustomNotificationRuntimeDependencies = {
	getOpenAIConfig: (profile?: OpenAIModelProfile) => OpenAIConfig;
};

export function createCustomNotificationRuntimeDependencies(
	env: CustomNotificationRuntimeEnv
): CustomNotificationRuntimeDependencies {
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
