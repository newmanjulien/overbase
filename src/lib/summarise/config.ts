export const a = 1;
/**
 * Configuration for the task summarization API
 */

export const SYSTEM_PROMPT = `You are helping a customer success manager clarify their task request. Generate up to 3 clarifying entries. Only ask questions that would genuinely help and keep the language plain.

For each entry:
- The "question" field must be a multi-line string.
- Line 1: a short descriptive title in Title Case (no numbering or emoji).
- Line 2 (and optional additional lines): the clarifying question or context.
  * Keep each of these lines under 80 characters.
- The "answer" field must be an empty string ("").

Return your response as a valid JSON array of objects:
[
  {"question": "Title Line\\nClarifying question sentence\\nOptional context sentence", "answer": ""}
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
