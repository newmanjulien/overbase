"use client";

import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import {
  EditorState,
  $getRoot,
  type SerializedEditorState,
  type SerializedLexicalNode,
} from "lexical";
import { $isRootTextContentEmpty } from "@lexical/text";

export default function PlainTextPlugin({
  onChange,
  onChangeRich,
}: {
  onChange: (text: string) => void;
  onChangeRich: (
    json: SerializedEditorState<SerializedLexicalNode> | null
  ) => void;
}) {
  return (
    <OnChangePlugin
      onChange={(editorState: EditorState) => {
        editorState.read(() => {
          const isEmpty = $isRootTextContentEmpty(true);
          const text = $getRoot().getTextContent();
          const json =
            editorState.toJSON() as SerializedEditorState<SerializedLexicalNode>;

          onChange(text);
          onChangeRich(isEmpty ? null : json);
        });
      }}
    />
  );
}
