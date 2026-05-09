export declare const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
export declare const STRUCTURED_MAX_OUTPUT_TOKENS = 8000;
export type OpenAIModelProfile = 'default' | 'fast';
export type OpenAIReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';
export type OpenAIConfig = {
    apiKey: string;
    model: string;
    reasoningEffort: OpenAIReasoningEffort;
};
export type OpenAIConfigParams = {
    apiKey: string | undefined;
    chatModel?: string;
    fastChatModel?: string;
    reasoningEffort?: string;
    fastReasoningEffort?: string;
    profile?: OpenAIModelProfile;
};
export declare function getOpenAIConfig({ apiKey, chatModel, fastChatModel, reasoningEffort: configuredReasoningEffort, fastReasoningEffort, profile }: OpenAIConfigParams): OpenAIConfig;
export declare function supportsReasoningOptions(model: string): boolean;
export declare function getOpenAIHeaders(apiKey: string): {
    Authorization: string;
    'Content-Type': string;
};
export declare function getOpenAIErrorMessage(response: Response): Promise<string>;
export declare function callStructuredTool<T>(params: {
    systemPrompt: string;
    userPrompt: string;
    toolName: string;
    toolDescription: string;
    toolParameters: unknown;
    openAIConfig: OpenAIConfig;
}): Promise<T>;
//# sourceMappingURL=openai.d.ts.map