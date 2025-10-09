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

function normalizeSummaryResponse(raw: string): string {
  const trimmed = raw.trim();
  const withoutCodeFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/, "")
    .trim();

  const candidate = withoutCodeFence.length > 0 ? withoutCodeFence : trimmed;

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new Error("Summarizer response was not valid JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Summarizer response must be a JSON array");
  }

  return JSON.stringify(parsed);
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
          details: "Please provide a valid task description to summarize",
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
      // Skip actual LLM call in development
      // if (process.env.NODE_ENV === 'development') {
      //   console.log('Skipping LLM call in development mode');
      //   return NextResponse.json<SummariseResponse>({
      //     summary: `[MOCK SUMMARY] This is a mock summary for: ${promptText.substring(0, 50)}${promptText.length > 50 ? '...' : ''}`,
      //     serverUpdated,
      //   });
      // }

      const responseText = await provider.generate(promptText);
      const summaryJson = normalizeSummaryResponse(responseText);

      if (serverUpdated && uid && requestId) {
        try {
          await markSummarySuccess(uid, requestId, summaryJson, promptText);
        } catch (err) {
          console.warn("markSummarySuccess failed", err);
          serverUpdated = false;
        }
      }

      return NextResponse.json<SummariseResponse>({
        summary: summaryJson,
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

    const message =
      error instanceof Error ? error.message : "Unknown error";
    const isFormattingIssue =
      error instanceof Error &&
      error.message.includes("Summarizer response");

    const friendlyFormattingMessage =
      "We couldn't generate clarifying questions right now. Please try again.";
    const friendlyGenericMessage =
      "Something went wrong while generating clarifying questions. Please try again.";

    return NextResponse.json<ErrorResponse>(
      {
        error: isFormattingIssue
          ? friendlyFormattingMessage
          : friendlyGenericMessage,
        details: message,
      },
      { status: isFormattingIssue ? 502 : 500 },
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
      details: "This endpoint requires a POST request",
    },
    { status: 405 },
  );
}
