"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";

export default function SyncPlugin({
  value,
  valueRich,
}: {
  value: string;
  valueRich: any;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();

      if (valueRich) {
        try {
          const parsed = editor.parseEditorState(valueRich);
          editor.setEditorState(parsed);
          return;
        } catch (err) {
          console.warn(
            "Invalid Lexical state, falling back to plain text:",
            err
          );
        }
      }

      if (value) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(value));
        root.append(paragraph);
      }
    });
  }, [editor, value, valueRich]);

  return null;
}
