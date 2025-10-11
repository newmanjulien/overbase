// ============================================================================
// File: components/blocks/RichTextarea/index.tsx
// Description: Lexical-friendly RichTextarea — uncontrolled by React props,
//              one-way sync out, imperative control in via ref/editor callbacks.
// ============================================================================
"use client";

import React, { useImperativeHandle, useRef, forwardRef, useMemo } from "react";
import {
  LexicalComposer,
  type InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type SerializedEditorState,
  type SerializedLexicalNode,
} from "lexical";

import PlainTextSyncPlugin from "./plugins/PlainTextSyncPlugin";
import EditablePlugin from "./plugins/EditablePlugin";
import InitialContentPlugin from "./plugins/InitialContentPlugin";
import MentionPlugin from "./plugins/MentionPlugin";
import { MentionNode } from "./nodes/MentionNode";

/* -------------------------------------------------------------------------- */
/*                            Public Component API                            */
/* -------------------------------------------------------------------------- */

export type RichJSON = SerializedEditorState<SerializedLexicalNode>;

export type MentionOption = { id: string; name: string; logo?: string };

export type RichTextHandle = {
  /** Replace content with plain text */
  setText: (text: string) => void;
  /** Replace content with previously persisted Lexical JSON */
  setRichJSON: (json: RichJSON) => void;
  /** Clear the editor */
  clear: () => void;
  /** Focus the editor */
  focus: () => void;
  /** Enable/disable editing */
  setEditable: (editable: boolean) => void;
  /** Access the underlying Lexical editor instance */
  getEditor: () => import("lexical").LexicalEditor | null;
};

interface RichTextProps {
  /** Applied once on mount. Prefer using the imperative API for later changes. */
  defaultText?: string;
  /** Applied once on mount. Prefer using the imperative API for later changes. */
  defaultRichJSON?: RichJSON | null;
  /** One-way sync out (text only) */
  onChangeText?: (text: string) => void;
  /** One-way sync out (null if empty) */
  onChangeRichJSON?: (json: RichJSON | null) => void;
  /** Visual placeholder shown when content is empty */
  placeholder?: string;
  /** Mention datasource */
  mentionOptions?: MentionOption[];
  /** Start disabled */
  disabled?: boolean;
  /** Container classes */
  className?: string;
}

const RichText = forwardRef<RichTextHandle, RichTextProps>(
  (
    {
      defaultText,
      defaultRichJSON,
      onChangeText,
      onChangeRichJSON,
      placeholder,
      mentionOptions = [],
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const internalEditorRef = useRef<import("lexical").LexicalEditor | null>(
      null
    );

    const initialConfig = useMemo<InitialConfigType>(
      () => ({
        namespace: "RequestEditor",
        editable: !disabled,
        onError: (err) => console.error("Lexical error:", err),
        nodes: [MentionNode],
      }),
      [disabled]
    );

    // Bridge editor instance out via ref with an imperative API
    useImperativeHandle(
      ref,
      (): RichTextHandle => ({
        setText: (text: string) => {
          const editor = internalEditorRef.current;
          if (!editor) return;
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            const p = $createParagraphNode();
            p.append($createTextNode(text));
            root.append(p);
          });
        },
        setRichJSON: (json: RichJSON) => {
          const editor = internalEditorRef.current;
          if (!editor) return;
          const parsed = editor.parseEditorState(JSON.stringify(json));
          editor.setEditorState(parsed);
        },
        clear: () => {
          const editor = internalEditorRef.current;
          if (!editor) return;
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            root.append($createParagraphNode());
          });
        },
        focus: () => internalEditorRef.current?.focus(),
        setEditable: (editable: boolean) =>
          internalEditorRef.current?.setEditable(editable),
        getEditor: () => internalEditorRef.current,
      }),
      []
    );

    return (
      <div
        className={`relative border rounded-xl border-gray-200 bg-white text-sm leading-relaxed ${
          disabled ? "bg-gray-100 opacity-70" : ""
        } ${className}`}
      >
        <LexicalComposer initialConfig={initialConfig}>
          {/* Capture the editor instance on first render */}
          <EditorRefCapture onReady={(e) => (internalEditorRef.current = e)} />

          <div className="relative flex flex-col p-3">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="flex-1 outline-none leading-relaxed" />
              }
              placeholder={
                placeholder ? (
                  <div className="absolute top-3 left-3 text-gray-400 select-none pointer-events-none">
                    {placeholder}
                  </div>
                ) : null
              }
              ErrorBoundary={LexicalErrorBoundary}
            />

            <HistoryPlugin />
            <PlainTextSyncPlugin
              onChangeText={onChangeText}
              onChangeRichJSON={onChangeRichJSON}
            />
            <EditablePlugin disabled={disabled} />
            <InitialContentPlugin
              defaultText={defaultText}
              defaultRichJSON={defaultRichJSON}
            />
            <MentionPlugin
              mentionOptions={mentionOptions}
              disabled={disabled}
            />
          </div>
        </LexicalComposer>
      </div>
    );
  }
);

export default RichText;

/* ---------------------------------- Helper --------------------------------- */
function EditorRefCapture({
  onReady,
}: {
  onReady: (e: import("lexical").LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    onReady(editor);
  }, [editor, onReady]);
  return null;
}
