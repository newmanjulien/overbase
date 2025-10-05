"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $isTextNode,
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  KEY_ESCAPE_COMMAND,
} from "lexical";
import Image from "next/image";

interface MentionOption {
  name: string;
  logo?: string;
}

export default function MentionPlugin({
  mentionOptions,
  disabled,
}: {
  mentionOptions: MentionOption[];
  disabled?: boolean;
}) {
  const [editor] = useLexicalComposerContext();
  const [show, setShow] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionOption[]>([]);
  const [highlight, setHighlight] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect mentions
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
          const filtered = mentionOptions.filter((m) =>
            m.name.toLowerCase().includes(q.toLowerCase())
          );
          setSuggestions(filtered);
          setHighlight(0);
          setShow(true);
        } else {
          setShow(false);
        }
      });
    });
  }, [editor, mentionOptions, disabled]);

  const insertMention = useCallback(
    (name: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        const node = selection.anchor.getNode();
        if ($isTextNode(node)) {
          const text = node.getTextContent();
          const at = text.lastIndexOf("@", selection.anchor.offset - 1);
          if (at !== -1) {
            node.spliceText(at, selection.anchor.offset, "");
            const mention = $createTextNode(`@${name}`);
            mention.setStyle("color:#3b82f6;font-weight:500;");
            node.insertAfter(mention);
            mention.insertAfter($createTextNode(" "));
            mention.selectNext();
          }
        }
      });
      setShow(false);
    },
    [editor]
  );

  // Keyboard handlers
  useEffect(() => {
    if (disabled) return;
    const unsubs = [
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (e) => {
          if (!show || !suggestions.length) return false;
          e?.preventDefault();
          setHighlight((i) => (i + 1) % suggestions.length);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        (e) => {
          if (!show || !suggestions.length) return false;
          e?.preventDefault();
          setHighlight(
            (i) => (i - 1 + suggestions.length) % suggestions.length
          );
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (e) => {
          if (!show || !suggestions.length) return false;
          e?.preventDefault();
          insertMention(suggestions[highlight].name);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (e) => {
          if (!show || !suggestions.length) return false;
          e?.preventDefault();
          insertMention(suggestions[highlight].name);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        (e) => {
          if (!show) return false;
          e?.preventDefault();
          setShow(false);
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, [editor, show, suggestions, highlight, insertMention, disabled]);

  if (!show || disabled || !suggestions.length) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute left-2 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-1"
    >
      {suggestions.map((s, i) => (
        <div
          key={s.name}
          onMouseDown={(e) => {
            e.preventDefault();
            insertMention(s.name);
          }}
          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
            i === highlight ? "bg-gray-100" : "hover:bg-gray-100"
          }`}
        >
          {s.logo && (
            <Image
              src={s.logo}
              alt={s.name}
              width={20}
              height={20}
              className="rounded-full object-cover"
            />
          )}
          <span className="text-gray-800 font-medium">{s.name}</span>
        </div>
      ))}
    </div>
  );
}
