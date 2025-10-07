"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

/**
 * Ensures Lexical's React decorator portal system is mounted,
 * even when the editor starts in read-only mode.
 */
export default function DecoratorHostPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Make the editor temporarily editable so it initializes portals
    editor.setEditable(true);
    editor.update(() => {}); // triggers a reconciliation cycle
    requestAnimationFrame(() => editor.setEditable(false));
  }, [editor]);

  return null;
}
