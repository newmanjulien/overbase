// ============================================================================
// File: components/blocks/RichTextarea/nodes/MentionNode.tsx
// Description: Decorator node for mentions with safe import/export.
// ============================================================================
("use client");

import React from "react";
import Image from "next/image";
import {
  DecoratorNode,
  type NodeKey,
  type DOMConversionMap,
  type DOMConversion,
  type DOMConversionOutput,
  type LexicalNode,
  type DOMExportOutput,
} from "lexical";

export type MentionPayload = { id: string; name: string; logo?: string };
export const MENTION_TYPE = "mention" as const;

export type SerializedMentionNode = {
  type: typeof MENTION_TYPE;
  version: 1;
  id: string;
  name: string;
  logo?: string;
};

function MentionChip({ name, logo }: MentionPayload) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1 py-0.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium"
      data-mention="true"
      contentEditable={false}
    >
      {logo && (
        <Image
          src={logo}
          alt={name}
          width={14}
          height={14}
          className="rounded object-cover"
        />
      )}
      {name}
    </span>
  );
}

export class MentionNode extends DecoratorNode<React.ReactElement> {
  __id: string;
  __name: string;
  __logo?: string;

  static getType(): string {
    return MENTION_TYPE;
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__id, node.__name, node.__logo, node.__key);
  }

  constructor(id: string, name: string, logo?: string, key?: NodeKey) {
    super(key);
    this.__id = id;
    this.__name = name;
    this.__logo = logo;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "mention-wrapper";
    span.setAttribute("data-mention-id", this.__id);
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactElement {
    return <MentionChip id={this.__id} name={this.__name} logo={this.__logo} />;
  }

  exportJSON(): SerializedMentionNode {
    return {
      type: MENTION_TYPE,
      version: 1 as const,
      id: this.__id,
      name: this.__name,
      logo: this.__logo,
    };
  }

  static importJSON(serialized: any): MentionNode {
    if (!serialized || serialized.type !== MENTION_TYPE) {
      throw new Error("Invalid mention node JSON");
    }
    return new MentionNode(serialized.id, serialized.name, serialized.logo);
  }

  static importDOM(): DOMConversionMap {
    return {
      span: (domNode: HTMLElement): DOMConversion | null => {
        if (!domNode.hasAttribute("data-mention-id")) return null;
        return {
          conversion: (element: HTMLElement): DOMConversionOutput => {
            const id = element.getAttribute("data-mention-id") ?? "";
            const name = element.textContent?.replace(/^@/, "") || id;
            return { node: new MentionNode(id, name) };
          },
          priority: 1,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement("span");
    el.setAttribute("data-mention-id", this.__id);
    el.textContent = `@${this.__name}`;
    return { element: el };
  }

  isInline(): boolean {
    return true;
  }

  isIsolated(): boolean {
    return false;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

export function $createMentionNode(payload: MentionPayload): MentionNode {
  return new MentionNode(payload.id, payload.name, payload.logo);
}

export function $isMentionNode(
  node: LexicalNode | null | undefined
): node is MentionNode {
  return node instanceof MentionNode;
}
