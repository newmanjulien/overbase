// ============================================================================
// File: components/blocks/RichTextarea/plugins/MentionPlugin.tsx
// Description: Simple, robust mentions using LexicalTypeaheadMenuPlugin.
//              No rAF loops; rely on anchorRef positioning from the plugin.
// ============================================================================
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createPortal } from "react-dom";
import { $createMentionNode } from "../nodes/MentionNode";
import { $getSelection, $isRangeSelection } from "lexical";

export type MentionOption = { id: string; name: string; logo?: string };

class MentionMenuOption extends MenuOption {
  id: string;
  name: string;
  logo?: string;
  constructor({ id, name, logo }: MentionOption) {
    super(id);
    this.id = id;
    this.name = name;
    this.logo = logo;
  }
  getLabel() {
    return this.name;
  }
}

function MentionDropdown({
  options,
  selectedIndex,
  onSelect,
  anchorRect,
  className = "",
}: {
  options: MentionMenuOption[];
  selectedIndex: number;
  onSelect: (opt: MentionMenuOption) => void;
  anchorRect?: DOMRect | null;
  className?: string;
}) {
  if (!anchorRect || options.length === 0) return null;
  const style: React.CSSProperties = {
    position: "fixed",
    top: anchorRect.bottom + 6,
    left: anchorRect.left,
    zIndex: 10000,
    maxHeight: 240,
    overflowY: "auto",
  };
  return createPortal(
    <div
      className={`min-w-[220px] border rounded-md bg-white shadow-md text-sm ${className}`}
      style={style}
    >
      {options.map((opt, i) => (
        <button
          key={opt.id}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(opt);
          }}
          className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50 ${
            i === selectedIndex ? "bg-blue-50 text-blue-700" : ""
          }`}
        >
          {opt.logo && (
            <Image
              src={opt.logo}
              alt={opt.name}
              width={18}
              height={18}
              className="rounded"
            />
          )}
          <span className="font-medium">{opt.name}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

export default function MentionPlugin({
  mentionOptions,
  disabled = false,
  menuClassName = "",
}: {
  mentionOptions: MentionOption[];
  disabled?: boolean;
  menuClassName?: string;
}) {
  const [editor] = useLexicalComposerContext();

  const options = useMemo(
    () => mentionOptions.map((m) => new MentionMenuOption(m)),
    [mentionOptions]
  );

  const triggerFn = (text: string) => {
    const match = /(^|\\s)@([\\p{L}\\p{N}_-]{0,30})$/u.exec(text);
    if (!match) return null;
    return {
      leadOffset: match.index + match[1].length,
      matchingString: match[2],
      replaceableString: match[0].trim(),
    };
  };

  if (typeof window === "undefined") return null;

  return (
    <LexicalTypeaheadMenuPlugin<MentionMenuOption>
      triggerFn={triggerFn}
      options={options}
      onQueryChange={(q) => {
        const query = (q || "").toLowerCase();
        options.forEach((o: any) => (o.hidden = false));
        if (query) {
          options.forEach((o: any) => {
            o.hidden = !o.name.toLowerCase().includes(query);
          });
        }
      }}
      onSelectOption={(option, nodeToReplace, closeMenu) => {
        if (disabled) return;
        editor.update(() => {
          const node = $createMentionNode({
            id: option.id,
            name: option.name,
            logo: option.logo,
          });
          if (nodeToReplace) {
            nodeToReplace.replace(node);
          } else {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) selection.insertNodes([node]);
          }
          const selection = $getSelection();
          if ($isRangeSelection(selection)) selection.insertText(" ");
        });
        closeMenu();
      }}
      menuRenderFn={(anchorRef, menuProps) => {
        const { selectedIndex, selectOptionAndCleanUp, options } = menuProps;
        // anchorRef.current holds the element; use its DOMRect for positioning
        const rect = anchorRef.current?.getBoundingClientRect?.() ?? null;

        return (
          <MentionDropdown
            options={(options as MentionMenuOption[]).filter(
              (o: any) => !o.hidden
            )}
            selectedIndex={selectedIndex ?? -1} // ✅ safe default
            onSelect={selectOptionAndCleanUp}
            anchorRect={rect}
            className={menuClassName}
          />
        );
      }}
    />
  );
}
