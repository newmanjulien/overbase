// ============================================================================
// File: components/blocks/RichTextarea/plugins/PlainTextSyncPlugin.tsx
// Description: One-way sync from Lexical -> external listeners. No feedback loop.
// ============================================================================
"use client";

import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import {
  $getRoot,
  type EditorState,
  type SerializedEditorState,
  type SerializedLexicalNode,
} from "lexical";
import { $isRootTextContentEmpty } from "@lexical/text";

export default function PlainTextSyncPlugin({
  onChangeText,
  onChangeRichJSON,
}: {
  onChangeText?: (text: string) => void;
  onChangeRichJSON?: (
    json: SerializedEditorState<SerializedLexicalNode> | null
  ) => void;
}) {
  return (
    <OnChangePlugin
      onChange={(editorState: EditorState) => {
        editorState.read(() => {
          const text = $getRoot().getTextContent();
          const isEmpty = $isRootTextContentEmpty(true);
          const json =
            editorState.toJSON() as SerializedEditorState<SerializedLexicalNode>;
          onChangeText?.(text);
          onChangeRichJSON?.(isEmpty ? null : json);
        });
      }}
    />
  );
}
