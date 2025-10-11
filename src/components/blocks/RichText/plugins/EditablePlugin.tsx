// ============================================================================
// File: components/blocks/RichTextarea/plugins/EditablePlugin.tsx
// Description: React -> Lexical: editable state, changes only when prop flips.
// ============================================================================
"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export default function EditablePlugin({ disabled }: { disabled: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(!disabled);
  }, [editor, disabled]);
  return null;
}
