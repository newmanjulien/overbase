"use client";

import { useEffect } from "react";
import { Editor, EditorState, CompositeDecorator } from "draft-js";
import "draft-js/dist/Draft.css";

interface RichTextareaProps {
  editorState: EditorState;
  onChange: (state: EditorState) => void;
  placeholder?: string;
}

/**
 * A reusable Draft.js textarea with @mention highlighting.
 * No styling is applied here — consumers wrap it however they want.
 **/
export default function RichTextarea({
  editorState,
  onChange,
  placeholder = "Enter text...",
}: RichTextareaProps) {
  // Mention decorator
  const mentionDecorator = new CompositeDecorator([
    {
      strategy: (contentBlock, callback) => {
        const text = contentBlock.getText();
        const regex = /@\w+/g;
        let matchArr;
        while ((matchArr = regex.exec(text)) !== null) {
          callback(matchArr.index, matchArr.index + matchArr[0].length);
        }
      },
      component: (props: any) => (
        <span className="text-blue-500">{props.children}</span>
      ),
    },
  ]);

  useEffect(() => {
    // ensure the decorator is applied
    onChange(EditorState.set(editorState, { decorator: mentionDecorator }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Editor
      editorState={editorState}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
