"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
  ContentBlock,
} from "draft-js";
import "draft-js/dist/Draft.css";

interface RichTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  highlightRegex?: RegExp;
  highlightClassName?: string;
}

// Props passed to decorator components in Draft.js
interface DecoratorComponentProps {
  children: React.ReactNode;
  contentState: ContentState;
  entityKey: string | null;
  start: number;
  end: number;
}

/**
 * Drop-in Draft.js textarea with pattern highlighting.
 * Accepts plain string value and calls onChange with updated string.
 */
export default function RichTextarea({
  value,
  onChange,
  placeholder = "Enter text...",
  highlightRegex = /@\w+/g,
  highlightClassName = "text-blue-500",
}: RichTextareaProps) {
  // Create decorator whenever highlightRegex or highlightClassName changes
  const decorator = useMemo(
    () =>
      new CompositeDecorator([
        {
          strategy: (
            contentBlock: ContentBlock,
            callback: (start: number, end: number) => void
          ) => {
            const text = contentBlock.getText();
            const regex = new RegExp(
              highlightRegex.source,
              highlightRegex.flags
            ); // fresh regex each time
            let matchArr: RegExpExecArray | null;
            while ((matchArr = regex.exec(text)) !== null) {
              callback(matchArr.index, matchArr.index + matchArr[0].length);
            }
          },
          component: (props: DecoratorComponentProps) => (
            <span className={highlightClassName}>{props.children}</span>
          ),
        },
      ]),
    [highlightRegex, highlightClassName]
  );

  // Initial editor state
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(ContentState.createFromText(value), decorator)
  );

  // Sync external value and decorator
  useEffect(() => {
    const currentText = editorState.getCurrentContent().getPlainText();
    if (value !== currentText) {
      setEditorState(
        EditorState.createWithContent(
          ContentState.createFromText(value),
          decorator
        )
      );
    } else {
      // Reapply decorator even if value is the same but decorator changed
      setEditorState(EditorState.set(editorState, { decorator }));
    }
  }, [value, decorator]);

  const handleChange = (state: EditorState) => {
    setEditorState(state);
    onChange(state.getCurrentContent().getPlainText());
  };

  return (
    <div className="border rounded-md p-2 min-h-[5rem] text-sm border-gray-100">
      <Editor
        editorState={editorState}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );
}
