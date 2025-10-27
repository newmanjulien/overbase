export const a = 1;
/**
 * Configuration for the task refinement API
 */

export const SYSTEM_PROMPT = `You are an in-house data scientist in a business who has full access to all the business' data. 

You are helping a customer success manager get data they need to do their job. 

The customer success manager has explained what data they need. 

You must now ask questions to clarify the request they just made. 

Generate up to 3 clarifying questions. Only ask questions that would genuinely help and keep the language plain.

For each entry:
- The "question" field must be a multi-line string with exactly 2 lines.
- Line 1: a short descriptive title in Title Case (no numbering or emoji).
- Line 2: the clarifying question or context. Keep this line under 120 characters.
- The "answer" field must be an empty string ("").

Never ask about getting access to data. Assume you have infinite access already.

Return your response as a valid JSON array of objects:
[
  {"question": "Title Line\\nClarifying question sentence", "answer": ""}
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
  "openai-compatible":
    process.env.MODEL || HARDCODED_DEFAULT_MODELS["openai-compatible"],
  anthropic: process.env.MODEL || HARDCODED_DEFAULT_MODELS.anthropic,
};

export const MAX_TOKENS = 1024;

export const DEFAULT_PROVIDER: ProviderType = "openai";
