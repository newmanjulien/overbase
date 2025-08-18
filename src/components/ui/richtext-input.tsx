// "use client";

// import { useEffect } from "react";
// import { Editor, EditorState, CompositeDecorator } from "draft-js";
// import "draft-js/dist/Draft.css";

// interface RichTextareaProps {
//   editorState: EditorState;
//   onChange: (state: EditorState) => void;
//   placeholder?: string;
// }

// export default function RichTextarea({
//   editorState,
//   onChange,
//   placeholder = "Enter text...",
// }: RichTextareaProps) {
//   // Mention decorator
//   const mentionDecorator = new CompositeDecorator([
//     {
//       strategy: (contentBlock, callback) => {
//         const text = contentBlock.getText();
//         const regex = /@\w+/g;
//         let matchArr;
//         while ((matchArr = regex.exec(text)) !== null) {
//           callback(matchArr.index, matchArr.index + matchArr[0].length);
//         }
//       },
//       component: (props: any) => (
//         <span className="text-blue-500">{props.children}</span>
//       ),
//     },
//   ]);

//   useEffect(() => {
//     // ensure the decorator is applied
//     onChange(EditorState.set(editorState, { decorator: mentionDecorator }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <Editor
//       editorState={editorState}
//       onChange={onChange}
//       placeholder={placeholder}
//     />
//   );
// }

"use client";

import { useEffect, useState } from "react";
import {
  Editor,
  EditorState,
  CompositeDecorator,
  ContentState,
} from "draft-js";
import "draft-js/dist/Draft.css";

interface RichTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  highlightRegex?: RegExp;
  highlightClassName?: string;
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
        strategy: (contentBlock, callback) => {
          const text = contentBlock.getText();
          let matchArr;
          while ((matchArr = highlightRegex.exec(text)) !== null) {
            callback(matchArr.index, matchArr.index + matchArr[0].length);
          }
        },
        component: (props: any) => (
          <span className={highlightClassName}>{props.children}</span>
        ),
      },
    ]);
    return EditorState.createWithContent(
      ContentState.createFromText(value),
      decorator
    );
  });

  // Update internal EditorState when `value` prop changes
  useEffect(() => {
    const content = editorState.getCurrentContent().getPlainText();
    if (value !== content) {
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
    const plainText = state.getCurrentContent().getPlainText();
    onChange(plainText);
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
