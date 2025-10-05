"use client";

import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

import SyncPlugin from "./plugin-Sync";
import PlainTextPlugin from "./plugin-PlainText";
import MentionPlugin from "./plugin-Mention";

import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

interface RichTextareaProps {
  value: string; // plain text (for summaries)
  valueRich: SerializedEditorState<SerializedLexicalNode> | null; // lexical JSON
  onChange: (text: string) => void;
  onChangeRich: (
    json: SerializedEditorState<SerializedLexicalNode> | null
  ) => void;
  placeholder?: string;
  mentionOptions?: { name: string; logo?: string }[];
  disabled?: boolean;
  className?: string;
}

export default function RichTextarea({
  value,
  valueRich,
  onChange,
  onChangeRich,
  placeholder = "Type @ to mention a connector...",
  mentionOptions = [],
  disabled = false,
  className = "",
}: RichTextareaProps) {
  const initialConfig: InitialConfigType = {
    namespace: "RequestEditor",
    editable: !disabled,
    editorState: () => null, // hydrated by SyncPlugin
    onError: (err) => console.error("Lexical error:", err),
  };

  return (
    <div
      className={`relative border rounded-xl border-gray-200 bg-white p-2 ${className}`}
    >
      <LexicalComposer initialConfig={initialConfig}>
        {/* Prop → Editor hydration */}
        <SyncPlugin value={value} valueRich={valueRich} />

        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={`outline-none min-h-[5rem] px-2 py-1 ${
                disabled ? "opacity-70 cursor-not-allowed" : ""
              }`}
            />
          }
          placeholder={
            <div className="absolute top-2 left-3 text-gray-400 select-none pointer-events-none">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <HistoryPlugin />
        <PlainTextPlugin onChange={onChange} onChangeRich={onChangeRich} />

        {mentionOptions.length > 0 && (
          <MentionPlugin mentionOptions={mentionOptions} disabled={disabled} />
        )}
      </LexicalComposer>
    </div>
  );
}
