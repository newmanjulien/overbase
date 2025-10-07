"use client";

import { useEffect, memo } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { MentionNode } from "./node-Mention";

// --- optional: import shared theme if you have it ---
// import { LEXICAL_THEME } from "@/lib/lexical/config";

function ReadOnlyPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(false);
  }, [editor]);
  return null;
}

// Minimal error boundary so LexicalRichTextPlugin typings are satisfied
function LexicalErrorBoundary() {
  return null;
}

/**
 * Renders a Lexical editor state in read-only mode.
 * Perfect for displaying @mentions and formatted text in RowCard.
 */
export const RichTextareaView = memo(function RichTextareaView({
  valueRich,
  className,
}: {
  valueRich: any;
  className?: string;
}) {
  if (!valueRich || !valueRich.root) {
    console.error("RichTextareaView: invalid Lexical state provided.");
    return null;
  }

  const initialConfig = {
    namespace: "RichTextareaView",
    editable: false,
    nodes: [MentionNode],
    theme: {
      mention:
        "inline-flex items-center rounded-md bg-gray-100 text-gray-500 px-1 py-0.5 text-sm font-medium",
      paragraph: "mb-1 text-sm text-gray-700 leading-tight",
    },
    editorState: JSON.stringify(valueRich),
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={`outline-none cursor-default select-text whitespace-pre-wrap break-words ${
          className ?? ""
        }`}
      >
        <RichTextPlugin
          contentEditable={<ContentEditable className="outline-none" />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ReadOnlyPlugin />
      </div>
    </LexicalComposer>
  );
});
