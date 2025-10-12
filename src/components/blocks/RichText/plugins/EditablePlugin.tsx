"use client";
import { useLayoutEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export default function EditablePlugin({ disabled }: { disabled: boolean }) {
  const [editor] = useLexicalComposerContext();
  useLayoutEffect(() => {
    const desired = !disabled;
    if (editor.isEditable() !== desired) editor.setEditable(desired);
  }, [editor, disabled]);
  return null;
}
