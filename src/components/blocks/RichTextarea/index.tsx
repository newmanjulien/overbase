"use client";

import React, { useEffect, useMemo } from "react";
import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import PlainTextPlugin from "./plugin-PlainText";
import MentionPlugin from "./plugin-Mention";
import { MentionNode } from "./node-Mention";

import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

/* -------------------------------------------------------------------------- */
/*                                   Props                                    */
/* -------------------------------------------------------------------------- */

interface RichTextareaProps {
  initialValue?: string;
  initialValueRich?: SerializedEditorState<SerializedLexicalNode> | null;
  onChange?: (text: string) => void;
  onChangeRich?: (
    json: SerializedEditorState<SerializedLexicalNode> | null
  ) => void;
  resetKey?: string | number;
  placeholder?: string;
  mentionOptions?: { id: string; name: string; logo?: string }[];
  disabled?: boolean;
  className?: string;
  mentionMenuClassName?: string;
  mentionMenuStyle?: React.CSSProperties;
}

/* -------------------------------------------------------------------------- */
/*                          Editable state plugin                              */
/* -------------------------------------------------------------------------- */

function EditablePlugin({ disabled }: { disabled: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(!disabled);
  }, [editor, disabled]);
  return null;
}

/* -------------------------------------------------------------------------- */
/*                         Load-once or reset-on-key plugin                    */
/* -------------------------------------------------------------------------- */

function LoadStatePlugin({
  initialValue,
  initialValueRich,
  resetKey,
}: {
  initialValue?: string;
  initialValueRich?: SerializedEditorState<SerializedLexicalNode> | null;
  resetKey?: string | number;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();

      if (initialValueRich) {
        try {
          const parsed = editor.parseEditorState(
            JSON.stringify(initialValueRich)
          );
          editor.setEditorState(parsed);
          return;
        } catch (err) {
          console.warn("Invalid rich content, falling back to text:", err);
        }
      }

      const p = $createParagraphNode();
      if (initialValue) p.append($createTextNode(initialValue));
      root.append(p);
    });
  }, [editor, resetKey]);
  return null;
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export default function RichTextarea({
  initialValue,
  initialValueRich,
  onChange,
  onChangeRich,
  resetKey,
  placeholder = "Type @ to mention a connector...",
  mentionOptions = [],
  disabled = false,
  className = "",
  mentionMenuClassName,
  mentionMenuStyle,
}: RichTextareaProps) {
  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: "RequestEditor",
      editable: !disabled,
      onError: (err) => console.error("Lexical error:", err),
      nodes: [MentionNode],
    }),
    [disabled]
  );

  return (
    <div
      className={`relative border rounded-xl border-gray-200 bg-white text-sm leading-relaxed ${
        disabled ? "bg-gray-100 opacity-70 cursor-not-allowed" : ""
      } ${className}`}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative flex flex-col p-3">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`flex-1 outline-none leading-relaxed ${
                  disabled ? "cursor-not-allowed opacity-70" : ""
                }`}
              />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-gray-400 select-none pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin />
          <PlainTextPlugin
            onChange={(t) => onChange?.(t)}
            onChangeRich={(r) => onChangeRich?.(r)}
          />
          <EditablePlugin disabled={disabled} />
          <LoadStatePlugin
            initialValue={initialValue}
            initialValueRich={initialValueRich}
            resetKey={resetKey}
          />

          {/* ✅ Always mount the MentionPlugin */}
          <MentionPlugin
            mentionOptions={mentionOptions}
            disabled={disabled}
            menuClassName={mentionMenuClassName}
            menuStyle={mentionMenuStyle}
          />
        </div>
      </LexicalComposer>
    </div>
  );
}
