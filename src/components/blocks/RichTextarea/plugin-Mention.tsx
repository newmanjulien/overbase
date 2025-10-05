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

  // Position relative to the editor wrapper (parent of the root element)
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const getContainerRect = useCallback(() => {
    const root = editor.getRootElement();
    // The wrapper in index.tsx is the parent of the root <ContentEditable/>
    const container = root?.parentElement ?? undefined;
    return container?.getBoundingClientRect();
  }, [editor]);

  const updateDropdownPosition = useCallback(() => {
    const nativeSelection = window.getSelection();
    if (!nativeSelection || nativeSelection.rangeCount === 0) return;

    const range = nativeSelection.getRangeAt(0);
    const caretRect = range.getBoundingClientRect();
    const containerRect = getContainerRect();
    if (!containerRect) return;

    // Convert viewport coords -> container-relative coords
    const dropdownWidth = dropdownRef.current?.offsetWidth ?? 224; // Tailwind w-56 = 224px
    const padding = 6;

    let left = caretRect.left - containerRect.left;
    let top = caretRect.bottom - containerRect.top + padding;

    // Keep within container horizontally
    const maxLeft = Math.max(0, containerRect.width - dropdownWidth - 8);
    if (left > maxLeft) left = maxLeft;
    if (left < 8) left = 8;

    setPosition({ top, left });
  }, [getContainerRect]);

  // Detect mentions + compute position
  useEffect(() => {
    if (disabled) return;
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setShow(false);
          return;
        }

        const node = selection.anchor.getNode();
        const textBeforeCaret = node
          .getTextContent()
          .slice(0, selection.anchor.offset);

        const match = textBeforeCaret.match(/@([^\s@]*)$/);
        if (match) {
          const q = match[1];
          const filtered = mentionOptions.filter((m) =>
            m.name.toLowerCase().includes(q.toLowerCase())
          );
          setSuggestions(filtered);
          setHighlight(0);
          setShow(filtered.length > 0);
          // Position under caret
          updateDropdownPosition();
        } else {
          setShow(false);
        }
      });
    });
  }, [editor, mentionOptions, disabled, updateDropdownPosition]);

  // Reposition on scroll/resize while visible
  useEffect(() => {
    if (!show) return;
    const onScrollOrResize = () => updateDropdownPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [show, updateDropdownPosition]);

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

  // Absolutely position INSIDE the editor wrapper (relative container)
  return (
    <div
      ref={dropdownRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
      }}
      className="w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1"
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
