"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { createPortal } from "react-dom";
import Image from "next/image";
import { $createMentionNode } from "./node-Mention";

/* -------------------------------------------------------------------------- */
/*                          1. Menu Option Definition                         */
/* -------------------------------------------------------------------------- */

class MentionMenuOption extends MenuOption {
  id: string;
  name: string;
  logo?: string;

  constructor(id: string, name: string, logo?: string, key?: string) {
    super(key ?? id);
    this.id = id;
    this.name = name;
    this.logo = logo;
  }

  getLabel(): string {
    return this.name;
  }
}

/* -------------------------------------------------------------------------- */
/*                               2. Pure UI Menu                              */
/* -------------------------------------------------------------------------- */

function MentionMenu({
  options,
  selectedIndex,
  onSelect,
  style,
  menuClassName = "",
}: {
  options: MentionMenuOption[];
  selectedIndex: number;
  onSelect: (opt: MentionMenuOption) => void;
  style: React.CSSProperties;
  menuClassName?: string;
}) {
  const baseMenuClass =
    "max-h-[15rem] overflow-auto border rounded-md shadow-md bg-white text-sm";

  return (
    <div className={`${baseMenuClass} ${menuClassName}`} style={style}>
      {options.map((option, i) => (
        <div
          key={option.key || option.id || i}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(option);
          }}
          className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md transition-colors ${
            i === selectedIndex
              ? "bg-blue-50 text-blue-700"
              : "hover:bg-gray-50 text-gray-800"
          }`}
        >
          {option.logo && (
            <Image
              src={option.logo}
              alt={option.name}
              width={20}
              height={20}
              className="rounded-full object-cover"
            />
          )}
          <span className="font-medium">@{option.name}</span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              3. Mention Plugin                             */
/* -------------------------------------------------------------------------- */

export default function MentionPlugin({
  mentionOptions,
  disabled = false,
  menuClassName = "",
  menuStyle,
}: {
  mentionOptions: { id: string; name: string; logo?: string }[];
  disabled?: boolean;
  menuClassName?: string;
  menuStyle?: React.CSSProperties;
}) {
  const [editor] = useLexicalComposerContext();
  const [filteredOptions, setFilteredOptions] = useState<MentionMenuOption[]>(
    []
  );

  if (typeof window === "undefined") return null;

  /* -------------------------- 1️⃣ Trigger @ detection -------------------------- */
  const triggerFn = (text: string) => {
    const match = /(^|\s)@([\p{L}\p{N}_-]{0,30})$/u.exec(text);
    if (!match) return null;
    return {
      leadOffset: match.index + match[1].length,
      matchingString: match[2],
      replaceableString: match[0].trim(),
    };
  };

  /* ------------------------ 2️⃣ Build and filter options ------------------------ */
  const allOptions = useMemo(
    () =>
      mentionOptions.map(
        (m, i) =>
          new MentionMenuOption(
            m.id ?? String(i),
            m.name,
            m.logo,
            m.id ?? String(i)
          )
      ),
    [mentionOptions]
  );

  const handleQueryChange = (query: string | null) => {
    const q = query?.toLowerCase() ?? "";
    const results = q
      ? allOptions
          .filter((opt) => opt.name.toLowerCase().includes(q))
          .slice(0, 20)
      : allOptions;
    setFilteredOptions(results);
  };

  /* ---------------------------- 3️⃣ Render the menu ----------------------------- */

  return (
    <LexicalTypeaheadMenuPlugin<MentionMenuOption>
      triggerFn={triggerFn}
      options={filteredOptions}
      onQueryChange={handleQueryChange}
      onSelectOption={(option, nodeToReplace, closeMenu) => {
        if (disabled) return;
        editor.update(() => {
          const mentionNode = $createMentionNode({
            id: option.id,
            name: option.name,
            logo: option.logo,
          });

          if (nodeToReplace) {
            nodeToReplace.replace(mentionNode);
          } else {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertNodes([mentionNode]);
            }
          }

          const selection = $getSelection();
          if ($isRangeSelection(selection)) selection.insertText(" ");
        });
        closeMenu();
      }}
      menuRenderFn={(anchorRefFromLexical, menuProps) => {
        const { selectedIndex, selectOptionAndCleanUp } = menuProps as any;
        const anchorEl = anchorRefFromLexical?.current;

        const baseRect =
          ((menuProps as any).anchorRect as DOMRect | null) ??
          anchorEl?.getBoundingClientRect?.() ??
          null;

        // ✅ Stabilize the rect before rendering to prevent downward drift
        const [rect, setRect] = useState<DOMRect | null>(null);

        useEffect(() => {
          if (!baseRect) return;
          let lastRect: DOMRect | null = null;
          let frame: number;

          const checkStable = () => {
            const current = anchorEl?.getBoundingClientRect?.();
            if (
              current &&
              lastRect &&
              Math.abs(current.top - lastRect.top) < 0.5 &&
              Math.abs(current.left - lastRect.left) < 0.5
            ) {
              setRect(current);
            } else {
              lastRect = current || lastRect;
              frame = requestAnimationFrame(checkStable);
            }
          };

          frame = requestAnimationFrame(checkStable);
          return () => cancelAnimationFrame(frame);
        }, [anchorEl, baseRect?.top, baseRect?.left, baseRect?.bottom]);

        if (!rect || filteredOptions.length === 0) return null;

        const style: React.CSSProperties = {
          position: "fixed",
          top: rect.bottom + 6,
          left: rect.left,
          zIndex: 9999,
          ...menuStyle,
        };

        return createPortal(
          <MentionMenu
            options={filteredOptions}
            selectedIndex={selectedIndex ?? -1}
            onSelect={selectOptionAndCleanUp}
            style={style}
            menuClassName={menuClassName}
          />,
          document.body
        );
      }}
    />
  );
}
