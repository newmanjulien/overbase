/**provid
 * LLM Provider abstractions following the Strategy pattern
 * Each provider implements the same interface for easy swapping
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, DEFAULT_MODELS, MAX_TOKENS } from "./config";
import type { ProviderType } from "./config";

/**
 * Base interface all LLM providers must implement
 */
export interface LLMProvider {
  generate(text: string): Promise<string>;
}

/**
 * OpenAI implementation
 */
export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model || DEFAULT_MODELS.openai;
  }

  async generate(text: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    });

    return response.choices[0]?.message?.content || "";
  }
}

/**
 * Anthropic (Claude) implementation
 */
export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model || DEFAULT_MODELS.anthropic;
  }

  async generate(text: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const firstBlock = message.content[0];
    return firstBlock?.type === "text" ? firstBlock.text : "";
  }
}

/**
 * Factory function to create the appropriate provider
 * Centralizes provider selection logic
 */
export function createLLMProvider(
  providerType: ProviderType,
  apiKey: string,
  model?: string,
): LLMProvider {
  switch (providerType) {
    case "openai":
      return new OpenAIProvider(apiKey, model);
    case "anthropic":
      return new AnthropicProvider(apiKey, model);
    default:
      throw new Error(
        `Unsupported provider: ${providerType}. Supported providers: openai, anthropic`,
      );
  }
}

/**
 * Get API key from environment for the specified provider
 */
export function getApiKey(providerType: ProviderType): string {
  const key =
    providerType === "openai"
      ? process.env.OPENAI_API_KEY
      : process.env.ANTHROPIC_API_KEY;

  if (!key) {
    throw new Error(
      `${providerType.toUpperCase()}_API_KEY not found in environment variables`,
    );
  }

  return key;
}
