"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
  Modifier,
  SelectionState,
} from "draft-js";
import "draft-js/dist/Draft.css";

interface MentionOption {
  name: string;
  logo?: string;
}

interface RichTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mentionOptions?: MentionOption[];
  className?: string;
  disabled?: boolean;
}

export default function RichTextarea({
  value,
  onChange,
  placeholder = "Type @ to mention someone...",
  mentionOptions = [],
  className = "",
  disabled = false,
}: RichTextareaProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const editorRef = useRef<Editor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /** 🧩 Editor + mention state */
  const [mentions, setMentions] = useState<string[]>([]);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(ContentState.createFromText(value))
  );

  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionOption[]>([]);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  /** 🎨 Decorator: highlight known mentions */
  const decorator = useMemo(
    () =>
      new CompositeDecorator([
        {
          strategy: (contentBlock, callback) => {
            const text = contentBlock.getText();
            mentions.forEach((m) => {
              const index = text.indexOf(m);
              if (index !== -1) callback(index, index + m.length);
            });
          },
          component: (props: any) => (
            <span className="text-blue-500 font-medium">{props.children}</span>
          ),
        },
      ]),
    [mentions]
  );

  /** 🔁 Recreate editor state when mentions change */
  useEffect(() => {
    setEditorState(EditorState.set(editorState, { decorator }));
  }, [mentions]);

  /** 🧠 Sync parent value safely */
  useEffect(() => {
    const currentText = editorState.getCurrentContent().getPlainText();
    if (currentText !== value) {
      const content = ContentState.createFromText(value);
      setEditorState(EditorState.createWithContent(content, decorator));
    }
  }, [value, decorator]);

  /** ⌨️ Handle typing and show mention suggestions */
  const handleChange = (state: EditorState) => {
    setEditorState(state);
    const text = state.getCurrentContent().getPlainText();
    onChange(text);

    const selection = state.getSelection();
    const anchorKey = selection.getAnchorKey();
    const content = state.getCurrentContent();
    const block = content.getBlockForKey(anchorKey);
    const blockText = block.getText().slice(0, selection.getAnchorOffset());

    const match = blockText.match(/@([^\s@]*)$/);
    if (match) {
      const q = match[1];
      const filtered = mentionOptions.filter((opt) =>
        opt.name.toLowerCase().includes(q.toLowerCase())
      );
      setQuery(q);
      setSuggestions(filtered);
      setHighlightedIndex(0);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  /** 🧩 Insert a selected mention cleanly */
  const handleSelectMention = (mentionName: string) => {
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const anchorKey = selection.getAnchorKey();
    const anchorOffset = selection.getAnchorOffset();
    const block = content.getBlockForKey(anchorKey);
    const blockText = block.getText().slice(0, anchorOffset);

    const match = blockText.match(/@([^\s@]*)$/);
    const startOffset = match ? blockText.lastIndexOf("@") : anchorOffset;

    const mentionSelection = selection.merge({
      anchorOffset: startOffset,
      focusOffset: anchorOffset,
    }) as SelectionState;

    const fullMention = `@${mentionName}`;
    const newContent = Modifier.replaceText(
      content,
      mentionSelection,
      fullMention + " ",
      undefined
    );

    const newState = EditorState.push(
      editorState,
      newContent,
      "insert-characters"
    );

    setMentions((prev) => [...prev, fullMention]);
    setEditorState(
      EditorState.forceSelection(newState, newContent.getSelectionAfter())
    );
    onChange(newContent.getPlainText());
    setShowDropdown(false);
  };

  /** ⌨️ Keyboard navigation for dropdown */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        const selected = suggestions[highlightedIndex];
        if (selected) handleSelectMention(selected.name);
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        break;
    }
  };

  /** 🖱️ Hide dropdown when clicking outside editor + dropdown */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInside =
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target);

      if (!clickedInside) setShowDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** 🪄 SSR placeholder */
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

  /** ✨ Render Editor + Dropdown */
  return (
    <div
      ref={containerRef}
      className={`relative border rounded-md p-2 min-h-[5rem] text-sm border-gray-200 ${
        disabled ? "bg-gray-100 opacity-70 cursor-not-allowed" : ""
      } ${className}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => {
        if (!disabled) editorRef.current?.focus();
      }}
    >
      <Editor
        ref={editorRef}
        editorState={editorState}
        onChange={disabled ? () => {} : handleChange}
        placeholder={placeholder}
        readOnly={disabled}
      />

      {showDropdown && !disabled && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-2 top-full mt-1 w-60 bg-white border border-gray-200 rounded-xl shadow-md z-10 p-1"
        >
          {suggestions.map((s, i) => (
            <div
              key={s.name}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectMention(s.name);
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
      )}
    </div>
  );
}
