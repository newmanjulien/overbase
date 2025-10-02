/**
 * Task Summarization API Route
 * 
 * POST /api/tasks/summarise
 * 
 * Accepts task descriptions and returns structured summaries
 * using OpenAI or Anthropic LLMs
 */

import { NextRequest, NextResponse } from "next/server";
import { createLLMProvider, getApiKey } from "./providers";
import type { ProviderType } from "./config";

/**
 * Request body schema
 */
interface SummariseRequest {
  text: string;
  provider?: ProviderType;
  model?: string;
}

/**
 * Response body schema
 */
interface SummariseResponse {
  text: string;
}

/**
 * Error response schema
 */
interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * Validate request body
 */
function validateRequest(body: unknown): body is SummariseRequest {
  if (!body || typeof body !== "object") {
    return false;
  }

  const { text, provider, model } = body as Partial<SummariseRequest>;

  // text is required and must be non-empty string
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return false;
  }

  // provider is optional but must be valid if provided
  if (provider && provider !== "openai" && provider !== "anthropic") {
    return false;
  }

  // model is optional but must be string if provided
  if (model && typeof model !== "string") {
    return false;
  }

  return true;
}

/**
 * Main POST handler
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate request
    if (!validateRequest(body)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Invalid request",
          details:
            "Request must include 'text' field. Optional: 'provider' (openai|anthropic), 'model'",
        },
        { status: 400 }
      );
    }

    // Get provider type (default from env or request override)
    const defaultProvider =
      (process.env.LLM_PROVIDER as ProviderType) || "openai";
    const providerType = body.provider || defaultProvider;

    // Get API key for the provider
    let apiKey: string;
    try {
      apiKey = getApiKey(providerType);
    } catch (error) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Configuration error",
          details:
            error instanceof Error ? error.message : "API key not configured",
        },
        { status: 500 }
      );
    }

    // Create provider and generate response
    const provider = createLLMProvider(providerType, apiKey, body.model);
    const responseText = await provider.generate(body.text);

    return NextResponse.json<SummariseResponse>(
      { text: responseText },
      { status: 200 }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error("Task summarization error:", error);

    return NextResponse.json<ErrorResponse>(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported methods
 */
export async function GET() {
  return NextResponse.json<ErrorResponse>(
    {
      error: "Method not allowed",
      details: "Use POST method with JSON body containing 'text' field",
    },
    { status: 405 }
  );
}
