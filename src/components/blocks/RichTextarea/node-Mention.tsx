"use client";

import {
  DecoratorNode,
  DOMExportOutput,
  NodeKey,
  DOMConversionMap,
  DOMConversionOutput,
  DOMConversion,
} from "lexical";
import React from "react";

/* -------------------------------------------------------------------------- */
/*                             1. Mention Payload                             */
/* -------------------------------------------------------------------------- */

export interface MentionPayload {
  id: string; // Stable unique id (user id, connector id, etc.)
  name: string; // Display name
  logo?: string;
}

export const MENTION_TYPE = "mention" as const;

export type SerializedMentionNode = {
  type: typeof MENTION_TYPE;
  version: 1;
  id: string;
  name: string;
  logo?: string;
};

/* -------------------------------------------------------------------------- */
/*                          2. Mention React Component                        */
/* -------------------------------------------------------------------------- */

function MentionComponent({ name, logo }: MentionPayload) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1 py-0.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium"
      data-mention="true"
      contentEditable={false}
    >
      {logo && (
        // plain <img> keeps this node framework-agnostic
        <img
          src={logo}
          alt={name}
          width={14}
          height={14}
          className="rounded-full object-cover"
        />
      )}
      {name}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                           3. MentionNode Definition                        */
/* -------------------------------------------------------------------------- */

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
    return (
      <MentionComponent id={this.__id} name={this.__name} logo={this.__logo} />
    );
  }

  exportJSON(): SerializedMentionNode {
    return {
      type: MENTION_TYPE,
      version: 1,
      id: this.__id,
      name: this.__name,
      logo: this.__logo,
    };
  }

  static importJSON(serialized: SerializedMentionNode): MentionNode {
    return new MentionNode(serialized.id, serialized.name, serialized.logo);
  }

  // Properly typed importDOM with literal priority
  static importDOM(): DOMConversionMap {
    return {
      span: (domNode: HTMLElement): DOMConversion | null => {
        if (!domNode.hasAttribute("data-mention-id")) return null;

        return {
          conversion: (element: HTMLElement): DOMConversionOutput => {
            const id = element.getAttribute("data-mention-id")!;
            const name = element.textContent?.replace(/^@/, "") ?? id;
            return { node: new MentionNode(id, name) };
          },
          priority: 1, // valid literal type (0–4)
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-mention-id", this.__id);
    element.textContent = `@${this.__name}`;
    return { element };
  }

  isInline(): boolean {
    return true;
  }

  isIsolated(): boolean {
    return true; // Prevent cursor entering inside mention
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*                            4. Helper Functions                             */
/* -------------------------------------------------------------------------- */

export function $createMentionNode(payload: MentionPayload): MentionNode {
  return new MentionNode(payload.id, payload.name, payload.logo);
}

export function $isMentionNode(node: any): node is MentionNode {
  return node instanceof MentionNode;
}
