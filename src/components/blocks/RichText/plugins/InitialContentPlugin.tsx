// ============================================================================
// File: components/blocks/RichTextarea/plugins/InitialContentPlugin.tsx
// Description: Apply initial content exactly once on mount (no prop coupling).
// ============================================================================
"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

export default function InitialContentPlugin({
  defaultText,
  defaultRichJSON,
}: {
  defaultText?: string;
  defaultRichJSON?: SerializedEditorState<SerializedLexicalNode> | null;
}) {
  const [editor] = useLexicalComposerContext();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return; // run once
    appliedRef.current = true;

    if (defaultRichJSON) {
      try {
        const parsed = editor.parseEditorState(JSON.stringify(defaultRichJSON));
        editor.setEditorState(parsed);
        return;
      } catch (e) {
        console.warn("Invalid rich JSON; falling back to text.", e);
      }
    }

    if (defaultText) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const p = $createParagraphNode();
        p.append($createTextNode(defaultText));
        root.append(p);
      });
    }
  }, [editor, defaultText, defaultRichJSON]);

  return null;
}
