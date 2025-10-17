export const a = 1;
/**
 * Configuration for the task refinement API
 */

export const SYSTEM_PROMPT = `You are helping a customer success manager clarify their task request. Generate up to 3 clarifying entries. Only ask questions that would genuinely help and keep the language plain.

For each entry:
- The "question" field must be a multi-line string with exactly 2 lines.
- Line 1: a short descriptive title in Title Case (no numbering or emoji).
- Line 2: the clarifying question or context. Keep this line under 120 characters.
- The "answer" field must be an empty string ("").

Return your response as a valid JSON array of objects:
[
  {"question": "Title Line\\nClarifying question sentence", "answer": ""}
]`;

export const PROVIDERS = ["openai", "openai-compatible", "anthropic", "dev"] as const;
export type ProviderType = (typeof PROVIDERS)[number];

const HARDCODED_DEFAULT_MODELS: Record<ProviderType, string> = {
  openai: "gpt-4o-mini",
  "openai-compatible": "deepseek/deepseek-r1-distill-llama-70b:free",
  anthropic: "claude-3-5-sonnet-20241022",
  dev: "",
};

export const DEFAULT_MODELS: Record<ProviderType, string> = {
  openai: process.env.MODEL || HARDCODED_DEFAULT_MODELS.openai,
  "openai-compatible": process.env.MODEL || HARDCODED_DEFAULT_MODELS["openai-compatible"],
  anthropic: process.env.MODEL || HARDCODED_DEFAULT_MODELS.anthropic,
  dev: process.env.MODEL || HARDCODED_DEFAULT_MODELS.dev,
};

export const MAX_TOKENS = 1024;

export const DEFAULT_PROVIDER: ProviderType = "openai";
