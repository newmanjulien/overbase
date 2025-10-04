"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  LexicalComposer,
  InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $isTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  $createParagraphNode,
  EditorState,
  LexicalEditor,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  KEY_ESCAPE_COMMAND,
} from "lexical";

/* ----------------------------- Types ----------------------------- */

interface MentionOption {
  name: string;
  logo?: string;
}

interface RichTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mentionOptions?: MentionOption[];
  className?: string;
  disabled?: boolean;
}

/* --------------------- Keep editor in sync with prop --------------------- */

function SyncFromProp({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const current = editor
      .getEditorState()
      .read(() => $getRoot().getTextContent());
    if (current === value) return;

    editor.update(() => {
      const root = $getRoot();
      root.clear();
      if (value) {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(value));
        root.append(paragraph);
      }
    });
  }, [editor, value]);

  return null;
}

/* -------------------------- Mention Handler -------------------------- */

function MentionHandler({
  mentionOptions,
  disabled,
}: {
  mentionOptions: MentionOption[];
  disabled?: boolean;
}) {
  const [editor] = useLexicalComposerContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Detect @mentions
  useEffect(() => {
    if (disabled) return;

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const text = selection.anchor
          .getNode()
          .getTextContent()
          .slice(0, selection.anchor.offset);
        const match = text.match(/@([^\s@]*)$/);

        if (match) {
          const q = match[1];
          const filtered = mentionOptions.filter((opt) =>
            opt.name.toLowerCase().includes(q.toLowerCase())
          );
          setSuggestions(filtered);
          setHighlightedIndex(0);
          setShowDropdown(true);
        } else {
          setShowDropdown(false);
        }
      });
    });
  }, [editor, mentionOptions, disabled]);

  const insertMention = (mentionName: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchorNode = selection.anchor.getNode();

      if ($isTextNode(anchorNode)) {
        const text = anchorNode.getTextContent();
        const cursorOffset = selection.anchor.offset;
        const atIndex = text.lastIndexOf("@", cursorOffset - 1);

        if (atIndex !== -1) {
          anchorNode.spliceText(atIndex, cursorOffset, "");
          const mentionNode = $createTextNode(`@${mentionName}`);
          mentionNode.setStyle("color: #3b82f6; font-weight: 500;");
          anchorNode.insertAfter(mentionNode);
          const spaceNode = $createTextNode(" ");
          mentionNode.insertAfter(spaceNode);
          spaceNode.select();
        }
      } else {
        const mentionNode = $createTextNode(`@${mentionName}`);
        mentionNode.setStyle("color: #3b82f6; font-weight: 500;");
        selection.insertNodes([mentionNode]);
      }
    });

    setShowDropdown(false);
  };

  // Keyboard command handling
  useEffect(() => {
    if (disabled) return;

    const unregisters = [
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          if (!showDropdown || suggestions.length === 0) return false;
          event?.preventDefault();
          setHighlightedIndex((i) => (i + 1) % suggestions.length);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        (event) => {
          if (!showDropdown || suggestions.length === 0) return false;
          event?.preventDefault();
          setHighlightedIndex(
            (i) => (i - 1 + suggestions.length) % suggestions.length
          );
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          if (!showDropdown || suggestions.length === 0) return false;
          event?.preventDefault();
          const selected = suggestions[highlightedIndex];
          if (selected) insertMention(selected.name);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (event) => {
          if (!showDropdown || suggestions.length === 0) return false;
          event?.preventDefault();
          const selected = suggestions[highlightedIndex];
          if (selected) insertMention(selected.name);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        (event) => {
          if (!showDropdown) return false;
          event?.preventDefault();
          setShowDropdown(false);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
    ];

    return () => unregisters.forEach((unreg) => unreg());
  }, [editor, showDropdown, suggestions, highlightedIndex, disabled]);

  if (!showDropdown || disabled || suggestions.length === 0) return null;

  return (
    <div className="absolute left-2 top-full mt-1 w-60 bg-white border border-gray-200 rounded-xl shadow-md z-10 p-1">
      {suggestions.map((s, i) => (
        <div
          key={s.name}
          onMouseDown={(e) => {
            e.preventDefault();
            insertMention(s.name);
          }}
          className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer ${
            i === highlightedIndex ? "bg-gray-100" : "hover:bg-gray-100"
          }`}
        >
          {s.logo && (
            <img
              src={s.logo}
              alt={s.name}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
          )}
          <span className="text-gray-800 font-medium">{s.name}</span>
        </div>
      ))}
    </div>
  );
}

/* --------------------------- Main Component --------------------------- */

export default function RichText({
  value,
  onChange,
  placeholder = "Type @ to mention someone...",
  mentionOptions = [],
  className = "",
  disabled = false,
}: RichTextProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const initialConfig: InitialConfigType = useMemo(
    () => ({
      namespace: "RichText",
      editable: !disabled,
      onError: (e: Error) => console.error(e),
      editorState: (editor: LexicalEditor) => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          if (value) {
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(value));
            root.append(paragraph);
          }
        });
      },
    }),
    [disabled]
  );

  if (!mounted) {
    return (
      <div
        className={`relative border rounded-md p-2 min-h-[5rem] text-sm border-gray-200 ${className}`}
      >
        <div
          className={`text-gray-400 ${
            disabled ? "opacity-70 cursor-not-allowed" : ""
          }`}
          style={{
            whiteSpace: "pre-wrap",
            minHeight: "4rem",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {placeholder}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border rounded-md text-sm border-gray-200 ${
        disabled ? "bg-gray-100 opacity-70 cursor-not-allowed" : ""
      } ${className}`}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <SyncFromProp value={value} />

        <div className="flex flex-col min-h-[5rem] p-2">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`flex-1 outline-none leading-relaxed ${
                  disabled ? "cursor-not-allowed opacity-70" : ""
                }`}
              />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-gray-400 pointer-events-none select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        <HistoryPlugin />

        <OnChangePlugin
          onChange={(
            editorState: EditorState,
            _editor: LexicalEditor,
            _tags: Set<string>
          ) => {
            editorState.read(() => {
              const text = $getRoot().getTextContent();
              if (text !== value) onChange(text);
            });
          }}
        />

        <MentionHandler mentionOptions={mentionOptions} disabled={disabled} />
      </LexicalComposer>
    </div>
  );
}
