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
  summaryJson: string;
  summaryItems: SummaryItem[];
  serverUpdated: boolean;
}

/**
 * Error response schema
 */
interface ErrorResponse {
  error: string;
  details?: string;
}

interface SummaryItem {
  question: string;
  answer: string;
}

function normalizeSummaryResponse(raw: string): {
  summaryJson: string;
  summaryItems: SummaryItem[];
} {
  const trimmed = raw.trim();
  const withoutCodeFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/, "")
    .trim();

  const candidate = withoutCodeFence.length > 0 ? withoutCodeFence : trimmed;

  if (!candidate) {
    return { summaryJson: "", summaryItems: [] };
  }

  try {
    const summaryItems = JSON.parse(candidate) as SummaryItem[];
    return { summaryJson: candidate, summaryItems };
  } catch (error) {
    console.warn("Failed to parse summariser response as JSON", error);
    return { summaryJson: "", summaryItems: [] };
  }
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
        await markSummaryPending(uid, requestId);
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
      if (process.env.NODE_ENV === "development") {
        console.log("Skipping LLM call in development mode");
        const mockSummaryItems = [
          {
            question:
              "Clarify Main Goal\nWhat outcome do you want the automation to achieve?\nMention any success metrics if you have them.",
            answer: "",
          },
          {
            question:
              "Identify Primary Stakeholders\nWho will use or maintain this workflow day to day?",
            answer: "",
          },
        ];
        return NextResponse.json<SummariseResponse>({
          summaryJson: JSON.stringify(mockSummaryItems),
          summaryItems: mockSummaryItems,
          serverUpdated,
        });
      }

      const responseText = await provider.generate(promptText);
      const { summaryJson, summaryItems } =
        normalizeSummaryResponse(responseText);
      const sanitizedItems =
        summaryItems.length > 0
          ? summaryItems.map(({ question }) => ({ question, answer: "" }))
          : [];
      const sanitizedJson =
        sanitizedItems.length > 0 ? JSON.stringify(sanitizedItems) : summaryJson;

      if (serverUpdated && uid && requestId) {
        try {
          await markSummarySuccess(uid, requestId, sanitizedJson);
        } catch (err) {
          console.warn("markSummarySuccess failed", err);
          serverUpdated = false;
        }
      }

      return NextResponse.json<SummariseResponse>({
        summaryJson: sanitizedJson,
        summaryItems: sanitizedItems,
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
