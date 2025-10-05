"use client";

import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, $getRoot } from "lexical";

export default function PlainTextPlugin({
  onChange,
  onChangeRich,
}: {
  onChange: (text: string) => void;
  onChangeRich: (json: any) => void;
}) {
  return (
    <OnChangePlugin
      onChange={(editorState: EditorState) => {
        editorState.read(() => {
          const text = $getRoot().getTextContent().trim();
          const json = editorState.toJSON();

          onChange(text);
          onChangeRich(text.length === 0 ? null : json);
        });
      }}
    />
  );
}
