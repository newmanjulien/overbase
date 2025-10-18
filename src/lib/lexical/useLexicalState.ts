"use client";

import { useState, useRef, useEffect } from "react";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { lexicalToPlainText } from "@/lib/lexical/utils";

interface UseLexicalStateOptions {
  /** Initial rich text state from Firestore */
  initialPromptRich?: SerializedEditorState<SerializedLexicalNode> | null;
  /** Initial plain text fallback */
  initialPrompt?: string;
}

interface UseLexicalStateReturn {
  /** Current rich text state */
  promptRich: SerializedEditorState<SerializedLexicalNode> | null;
  /** Derived plain text from rich state */
  promptText: string;
  /** Update the rich text state */
  setPromptRich: (
    state: SerializedEditorState<SerializedLexicalNode> | null
  ) => void;
  /** Update plain text (for compatibility) */
  setPromptText: (text: string) => void;
}

/**
 * Hook to manage Lexical editor state with automatic plain text derivation
 * and Firestore hydration
 */
export function useLexicalState(
  options: UseLexicalStateOptions = {}
): UseLexicalStateReturn {
  const { initialPromptRich, initialPrompt } = options;

  const [promptRich, setPromptRich] =
    useState<SerializedEditorState<SerializedLexicalNode> | null>(null);

  // Use ref for plain text to avoid re-renders when manually updated
  const promptTextRef = useRef("");

  // Track if we've hydrated from Firestore
  const didHydrateRef = useRef(false);

  // Hydrate from Firestore once
  useEffect(() => {
    if (didHydrateRef.current) return;

    if (initialPromptRich) {
      setPromptRich(initialPromptRich);
      promptTextRef.current = lexicalToPlainText(initialPromptRich);
    } else if (initialPrompt) {
      promptTextRef.current = initialPrompt;
    }

    didHydrateRef.current = true;
  }, [initialPromptRich, initialPrompt]);

  // Derive current plain text from rich state or ref
  const promptText = promptRich
    ? lexicalToPlainText(promptRich)
    : promptTextRef.current;

  // Manual text setter (for compatibility with existing code)
  const setPromptText = (text: string) => {
    promptTextRef.current = text;
  };

  return {
    promptRich,
    promptText,
    setPromptRich,
    setPromptText,
  };
}
