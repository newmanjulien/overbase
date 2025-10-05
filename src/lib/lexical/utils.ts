import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

/**
 * Converts a serialized Lexical editor state to plain text.
 * Falls back gracefully if structure is malformed.
 */
export function lexicalToPlainText(
  serialized: SerializedEditorState<SerializedLexicalNode> | null
): string {
  if (
    !serialized ||
    typeof serialized !== "object" ||
    !("root" in serialized)
  ) {
    return "";
  }

  try {
    // Lexical JSON -> extract all text nodes
    const traverse = (node: any): string => {
      if (!node) return "";
      if (node.text) return node.text;
      if (Array.isArray(node.children)) {
        return node.children.map(traverse).join(" ");
      }
      return "";
    };

    return traverse(serialized.root).trim();
  } catch (err) {
    console.error("Failed to derive plain text from Lexical state:", err);
    return "";
  }
}
