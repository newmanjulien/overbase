/**
 * Task Refinement API Route
 *
 * POST /api/refine
 *
 * Accepts task descriptions and returns clarifying questions
 * using OpenAI or Anthropic LLMs
 */

import { NextRequest, NextResponse } from "next/server";
import { createLLMProvider, getApiKey } from "@/lib/refine/providers";
import {
  DEFAULT_PROVIDER,
  PROVIDERS,
  type ProviderType,
} from "@/lib/refine/config";
import { updateActive } from "@/lib/requests/service-Admin";

/**
 * Request body schema
 */
interface RefineRequest {
  text: string;
  requestId?: string;
  uid?: string;
  provider?: ProviderType;
  model?: string;
}

interface RefineResponse {
  refineJson: string;
  refineItems: RefineItem[];
  serverUpdated: boolean;
}

/**
 * Error response schema
 */
interface ErrorResponse {
  error: string;
  details?: string;
}

interface RefineItem {
  question: string;
  answer: string;
}

function normalizeRefineResponse(raw: string): {
  refineJson: string;
  refineItems: RefineItem[];
} {
  const trimmed = raw.trim();
  const withoutCodeFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/, "")
    .trim();

  const candidate = withoutCodeFence.length > 0 ? withoutCodeFence : trimmed;

  if (!candidate) {
    return { refineJson: "", refineItems: [] };
  }

  try {
    const refineItems = JSON.parse(candidate) as RefineItem[];
    return { refineJson: candidate, refineItems };
  } catch (error) {
    console.warn("Failed to parse refine response as JSON", error);
    return { refineJson: "", refineItems: [] };
  }
}

/**
 * Validate request body
 */
function validateRequest(body: unknown): body is RefineRequest {
  if (!body || typeof body !== "object") {
    return false;
  }

  const { text, provider, model } = body as Partial<RefineRequest>;

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
          details: "Please provide a valid task description to refine",
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

    try {
      // Skip actual LLM call in development
      if (process.env.NODE_ENV === "development") {
        console.log("Skipping LLM call in development mode");
        const mockRefineItems = [
          {
            question:
              "Clarify Main Goal\nWhat outcome do you want the automation to achieve?",
            answer: "",
          },
          {
            question:
              "Identify Primary Stakeholders\nWho will use or maintain this workflow day to day?",
            answer: "",
          },
        ];
        return NextResponse.json<RefineResponse>({
          refineJson: JSON.stringify(mockRefineItems),
          refineItems: mockRefineItems,
          serverUpdated,
        });
      }

      const responseText = await provider.generate(promptText);
      const { refineJson, refineItems } =
        normalizeRefineResponse(responseText);
      const sanitizedItems =
        refineItems.length > 0
          ? refineItems.map(({ question }) => ({ question, answer: "" }))
          : [];
      const sanitizedJson =
        sanitizedItems.length > 0 ? JSON.stringify(sanitizedItems) : refineJson;

      if (uid && requestId) {
        try {
          await updateActive(uid, requestId, { refineJson: sanitizedJson });
          serverUpdated = true;
        } catch (err) {
          console.warn("updateActive failed", err);
          serverUpdated = false;
        }
      }

      return NextResponse.json<RefineResponse>({
        refineJson: sanitizedJson,
        refineItems: sanitizedItems,
        serverUpdated,
      });
    } catch (err) {
      throw err;
    }
  } catch (error) {
    // Handle unexpected errors
    console.error("Task refine error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";
    const isFormattingIssue =
      error instanceof Error &&
      error.message.includes("Refine response");

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
