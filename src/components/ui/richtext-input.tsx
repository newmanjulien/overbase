"use client";

import { useEffect, useState } from "react";
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
  const [editorState, setEditorState] = useState(() => {
    const decorator = new CompositeDecorator([
      {
        strategy: (
          contentBlock: ContentBlock,
          callback: (start: number, end: number) => void
        ) => {
          const text = contentBlock.getText();
          let matchArr: RegExpExecArray | null;
          while ((matchArr = highlightRegex.exec(text)) !== null) {
            callback(matchArr.index, matchArr.index + matchArr[0].length);
          }
        },
        component: (props: DecoratorComponentProps) => (
          <span className={highlightClassName}>{props.children}</span>
        ),
      },
    ]);

    return EditorState.createWithContent(
      ContentState.createFromText(value),
      decorator
    );
  });

  // Sync internal EditorState with external `value` prop
  useEffect(() => {
    const currentText = editorState.getCurrentContent().getPlainText();
    if (value !== currentText) {
      const decorator = editorState.getDecorator();
      const newState = EditorState.createWithContent(
        ContentState.createFromText(value),
        decorator
      );
      setEditorState(newState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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
