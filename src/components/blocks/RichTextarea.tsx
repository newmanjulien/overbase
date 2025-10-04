"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";

interface RichTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mentionOptions?: string[];
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
  const mentionRegex = /@[^\s@]+(?:\s[^\s@]+)*/g;

  // ✅ decorator created once (safe, stable)
  const decorator = useMemo(
    () =>
      new CompositeDecorator([
        {
          strategy: (contentBlock, callback) => {
            const text = contentBlock.getText();
            let matchArr: RegExpExecArray | null;
            while ((matchArr = mentionRegex.exec(text)) !== null) {
              callback(matchArr.index, matchArr.index + matchArr[0].length);
            }
          },
          component: (props: any) => (
            <span className="text-blue-500 font-medium">{props.children}</span>
          ),
        },
      ]),
    []
  );

  // ✅ initial editor state with decorator
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(ContentState.createFromText(value), decorator)
  );

  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  // ✅ sync parent value safely (no getIn errors)
  useEffect(() => {
    const currentText = editorState.getCurrentContent().getPlainText();
    if (currentText !== value) {
      const content = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const newContent = Modifier.replaceText(content, selection, value);
      const newState = EditorState.push(
        editorState,
        newContent,
        "insert-characters"
      );
      setEditorState(
        EditorState.forceSelection(newState, newContent.getSelectionAfter())
      );
    }
  }, [value, decorator]);

  // ✅ handle typing & mention detection
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
        opt.toLowerCase().includes(q.toLowerCase())
      );
      setQuery(q);
      setSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  // ✅ insert mention
  const handleSelectMention = (mention: string) => {
    const content = editorState.getCurrentContent();
    const selection = editorState.getSelection();

    const newContent = Modifier.replaceText(
      content,
      selection,
      mention + " ",
      undefined
    );

    const newState = EditorState.push(
      editorState,
      newContent,
      "insert-characters"
    );

    setEditorState(
      EditorState.forceSelection(newState, newContent.getSelectionAfter())
    );
    onChange(newContent.getPlainText());
    setShowDropdown(false);
  };

  // ✅ SSR placeholder (looks like textarea — identical sizing & border)
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

  // ✅ Client-side editor render
  return (
    <div
      className={`relative border rounded-md p-2 min-h-[5rem] text-sm border-gray-200 ${
        disabled ? "bg-gray-100 opacity-70 cursor-not-allowed" : ""
      } ${className}`}
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
        <div className="absolute left-2 top-full mt-1 w-48 bg-white border border-gray-200 rounded shadow-md z-10">
          {suggestions.map((s) => (
            <div
              key={s}
              onMouseDown={() => handleSelectMention(s)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
