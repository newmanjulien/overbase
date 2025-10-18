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
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore";

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

    console.log("[/api/refine] process.env.LLM_PROVIDER:", process.env.LLM_PROVIDER);
    console.log("[/api/refine] envProvider:", envProvider);
    console.log("[/api/refine] defaultProvider:", defaultProvider);
    console.log("[/api/refine] body.provider:", body.provider);
    console.log("[/api/refine] Final provider type:", providerType);
    console.log("[/api/refine] Request ID:", requestId);
    console.log("[/api/refine] UID:", uid);

    // Get API key (skip for dev provider)
    let apiKey = "";
    if (providerType !== "dev") {
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
    }

    // Create provider and generate response
    const baseURL = process.env.BASE_URL;
    const provider = createLLMProvider(
      providerType,
      apiKey,
      body.model,
      baseURL,
    );

    try {
      const responseText = await provider.generate(promptText);
      const { refineJson, refineItems } =
        normalizeRefineResponse(responseText);
      const sanitizedItems =
        refineItems.length > 0
          ? refineItems.map(({ question }) => ({ question, answer: "" }))
          : [];
      const sanitizedJson =
        sanitizedItems.length > 0 ? JSON.stringify(sanitizedItems) : refineJson;

      console.log("[/api/refine] Generated refineJson:", sanitizedJson);

      // Update Firestore with the refined questions
      if (uid && requestId) {
        try {
          // Initialize Firebase client SDK if needed
          if (!getApps().length) {
            initializeApp({
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
              messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
            });
          }

          const db = getFirestore();
          const requestRef = doc(db, `users/${uid}/requests/${requestId}`);
          await updateDoc(requestRef, {
            refineJson: sanitizedJson,
            updatedAt: serverTimestamp(),
          });
          console.log("[/api/refine] Successfully updated Firestore");
        } catch (err) {
          console.warn("[/api/refine] Firestore update failed:", err);
        }
      }

      return NextResponse.json<RefineResponse>({
        refineJson: sanitizedJson,
        refineItems: sanitizedItems,
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
