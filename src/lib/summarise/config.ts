export const a = 1;
/**
 * Configuration for the task summarization API
 */

export const SYSTEM_PROMPT = `You are helping a customer success manager clarify their task request. Generate up to 3 brief one-line questions to better understand what they need, with a short probable answer for each. Only ask questions that would genuinely help - fewer than 3 are okay. Drop any filler words.

Return your response as a valid JSON array of objects:
[
  {"question": "Question?", "answer": "Answer"},
  {"question": "Question?", "answer": "Answer"}
]`;

export const PROVIDERS = ["openai", "openai-compatible", "anthropic"] as const;
export type ProviderType = (typeof PROVIDERS)[number];

const HARDCODED_DEFAULT_MODELS: Record<ProviderType, string> = {
  openai: "gpt-4o-mini",
  "openai-compatible": "deepseek/deepseek-r1-distill-llama-70b:free",
  anthropic: "claude-3-5-sonnet-20241022",
};

export const DEFAULT_MODELS: Record<ProviderType, string> = {
  openai: process.env.MODEL || HARDCODED_DEFAULT_MODELS.openai,
  "openai-compatible": process.env.MODEL || HARDCODED_DEFAULT_MODELS["openai-compatible"],
  anthropic: process.env.MODEL || HARDCODED_DEFAULT_MODELS.anthropic,
};

export const MAX_TOKENS = 1024;

export const DEFAULT_PROVIDER: ProviderType = "openai";
