export const a = 1;
/**
 * Configuration for the task summarization API
 */

export const SYSTEM_PROMPT = `You are helping a customer success manager. Understand their request and summarize what they want to do.
The summary should help the CS manager verify that their request is accurately understood. 
Split their request into individual tasks if applicable. 
Present these as bullet points
"You need me to:
- [Task 1]
- [Task 2]
- ... 
- [Task N]"
Do not add extra tasks or suggestions.

Example task: Cross-check and validate that all metrics, charts, and account performance details are refreshed and accurate for presentation`;

const HARDCODED_DEFAULT_MODELS = {
  openai: "gpt-4o-mini",
  "openai-compatible": "deepseek/deepseek-r1-distill-llama-70b:free",
  anthropic: "claude-3-5-sonnet-20241022",
} as const;

export const DEFAULT_MODELS = {
  openai: process.env.MODEL || HARDCODED_DEFAULT_MODELS.openai,
  "openai-compatible": process.env.MODEL || HARDCODED_DEFAULT_MODELS["openai-compatible"],
  anthropic: process.env.MODEL || HARDCODED_DEFAULT_MODELS.anthropic,
} as const;

export const MAX_TOKENS = 1024;

export type ProviderType = "openai" | "openai-compatible" | "anthropic";

export const DEFAULT_PROVIDER: ProviderType = "anthropic";