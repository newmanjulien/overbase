export declare const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
export declare const STRUCTURED_MAX_OUTPUT_TOKENS = 8000;
export type OpenAIModelProfile = 'default' | 'fast';
export type OpenAIReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';
export declare function getOpenAIConfig(profile?: OpenAIModelProfile): {
    apiKey: string;
    model: string;
    reasoningEffort: OpenAIReasoningEffort;
};
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
    profile?: OpenAIModelProfile;
}): Promise<T>;
//# sourceMappingURL=openai.d.ts.map