// "use client";

// import { useEffect, useRef } from "react";
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
// import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

// export default function InitialContentPlugin({
//   defaultText,
//   defaultRichJSON,
// }: {
//   defaultText?: string;
//   defaultRichJSON?: SerializedEditorState<SerializedLexicalNode> | null;
// }) {
//   const [editor] = useLexicalComposerContext();
//   const appliedRef = useRef(false);

//   useEffect(() => {
//     if (appliedRef.current) return; // run once
//     appliedRef.current = true;

//     if (defaultRichJSON) {
//       try {
//         const parsed = editor.parseEditorState(JSON.stringify(defaultRichJSON));
//         editor.setEditorState(parsed);
//         return;
//       } catch (e) {
//         console.warn("Invalid rich JSON; falling back to text.", e);
//       }
//     }

//     if (defaultText) {
//       editor.update(() => {
//         const root = $getRoot();
//         root.clear();
//         const p = $createParagraphNode();
//         p.append($createTextNode(defaultText));
//         root.append(p);
//       });
//     }
//   }, [editor, defaultText, defaultRichJSON]);

//   return null;
// }

"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

export default function InitialContentPlugin({
  defaultText,
  defaultRichJSON,
}: {
  defaultText?: string;
  defaultRichJSON?: SerializedEditorState<SerializedLexicalNode> | null;
}) {
  const [editor] = useLexicalComposerContext();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    // --- Lexical-native init pattern ---
    // Wait for DOM to exist, then set the state.
    queueMicrotask(() => {
      try {
        if (defaultRichJSON) {
          const parsed = editor.parseEditorState(
            JSON.stringify(defaultRichJSON)
          );
          editor.setEditorState(parsed);
          return;
        }

        if (defaultText) {
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            const p = $createParagraphNode();
            p.append($createTextNode(defaultText));
            root.append(p);
          });
        }
      } catch (e) {
        console.warn(
          "InitialContentPlugin: failed to apply initial content.",
          e
        );
      }
    });
  }, [editor, defaultText, defaultRichJSON]);

  return null;
}
