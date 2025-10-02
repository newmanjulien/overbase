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

export const DEFAULT_MODELS = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-20241022",
} as const;

export const MAX_TOKENS = 1024;

export type ProviderType = "openai" | "anthropic";
