import { createLLMProvider, getApiKey } from "./providers";
import { DEFAULT_PROVIDER } from "./config";

/**
 * Main function to summarise tasks from a prompt
 * Uses the configured LLM provider to generate a summary
 */
export async function summariseTasks(prompt: string): Promise<string> {
  const providerType = DEFAULT_PROVIDER;
  const apiKey = getApiKey(providerType);
  const provider = createLLMProvider(providerType, apiKey);

  return await provider.generate(prompt);
}
