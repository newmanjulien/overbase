import type { SerializedEditorState, SerializedLexicalNode } from "lexical";
import type { SerializedMentionNode } from "@/components/blocks/RichTextarea/node-Mention";

/**
 * Converts a serialized Lexical editor state to plain text.
 * Falls back gracefully if structure is malformed.
 */

type SerializedRichNode = SerializedLexicalNode | SerializedMentionNode;
type SerializedRichEditorState = SerializedEditorState<SerializedRichNode>;

interface SerializedParentNode extends SerializedLexicalNode {
  children?: SerializedRichNode[];
}

export function lexicalToPlainText(
  serialized: SerializedRichEditorState | null
): string {
  if (
    !serialized ||
    typeof serialized !== "object" ||
    !("root" in serialized)
  ) {
    return "";
  }

  try {
    const traverse = (node?: SerializedRichNode | null): string => {
      if (!node) return "";

      // Handle mentions
      if (node.type === "mention" && "name" in node && node.name) {
        return `@${node.name}`;
      }

      // Handle text nodes
      if ("text" in node && typeof node.text === "string") {
        return node.text;
      }

      // Handle parent nodes (paragraphs, roots, etc.)
      if (
        "children" in node &&
        Array.isArray((node as SerializedParentNode).children)
      ) {
        return ((node as SerializedParentNode).children ?? [])
          .map(traverse)
          .join(" ");
      }

      return "";
    };

    return traverse(serialized.root).trim();
  } catch (err) {
    console.error("Failed to derive plain text from Lexical state:", err);
    return "";
  }
}
