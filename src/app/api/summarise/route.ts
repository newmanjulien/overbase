/**
 * Task Summarization API Route
 *
 * POST /api/summarise
 *
 * Accepts task descriptions and returns structured summaries
 * using OpenAI or Anthropic LLMs
 */

import { NextRequest, NextResponse } from "next/server";
import { createLLMProvider, getApiKey } from "@/lib/summarise/providers";
import {
  DEFAULT_PROVIDER,
  PROVIDERS,
  type ProviderType,
} from "@/lib/summarise/config";
import {
  markSummaryFailure,
  markSummaryPending,
  markSummarySuccess,
} from "@/lib/requests/service-Admin";

/**
 * Request body schema
 */
interface SummariseRequest {
  text: string;
  requestId?: string;
  uid?: string;
  provider?: ProviderType;
  model?: string;
}

interface SummariseResponse {
  summary: string;
  serverUpdated: boolean;
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

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return false;
  }

  if (provider && !PROVIDERS.includes(provider as ProviderType)) {
    return false;
  }

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
        { status: 400 },
      );
    }

    // Get provider type (default from env or request override)
    const envProvider = process.env.LLM_PROVIDER;
    const defaultProvider = PROVIDERS.includes(envProvider as ProviderType)
      ? (envProvider as ProviderType)
      : DEFAULT_PROVIDER;
    const providerType = body.provider || defaultProvider;
    const promptText = body.text.trim();
    const requestId = body.requestId;
    const uid = body.uid;

    // Get API key
    let apiKey: string;
    try {
      apiKey = getApiKey();
    } catch (error) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Configuration error",
          details:
            error instanceof Error ? error.message : "API key not configured",
        },
        { status: 500 },
      );
    }

    // Create provider and generate response
    const baseURL = process.env.BASE_URL;
    const provider = createLLMProvider(
      providerType,
      apiKey,
      body.model,
      baseURL,
    );

    let serverUpdated = false;

    if (uid && requestId) {
      try {
        await markSummaryPending(uid, requestId, promptText);
        serverUpdated = true;
      } catch (err) {
        console.warn(
          "markSummaryPending failed, falling back to client update",
          err,
        );
        serverUpdated = false;
      }
    }

    try {
      let responseText: string;
      
      // Skip actual LLM call in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Skipping LLM call in development mode');
        responseText = `[MOCK SUMMARY] This is a mock summary for: ${promptText.substring(0, 50)}${promptText.length > 50 ? '...' : ''}`;
      } else {
        responseText = await provider.generate(promptText);
      }

      if (serverUpdated && uid && requestId) {
        try {
          await markSummarySuccess(uid, requestId, responseText, promptText);
        } catch (err) {
          console.warn("markSummarySuccess failed", err);
          serverUpdated = false;
        }
      }

      return NextResponse.json<SummariseResponse>({
        summary: responseText,
        serverUpdated,
      });
    } catch (err) {
      if (serverUpdated && uid && requestId) {
        try {
          await markSummaryFailure(uid, requestId);
        } catch (innerErr) {
          console.warn("markSummaryFailure failed", innerErr);
        }
      }

      throw err;
    }
  } catch (error) {
    // Handle unexpected errors
    console.error("Task summarization error:", error);

    return NextResponse.json<ErrorResponse>(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
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
    { status: 405 },
  );
}
