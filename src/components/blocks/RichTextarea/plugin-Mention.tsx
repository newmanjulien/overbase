"use client";

import React, { useMemo, useState, useLayoutEffect, useEffect } from "react";
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
/*                              2. Mention Plugin                             */
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

  const [filteredOptions, setFilteredOptions] = useState(allOptions);

  const handleQueryChange = (query: string | null) => {
    const q = query?.toLowerCase() ?? "";
    setFilteredOptions(
      q
        ? allOptions
            .filter((opt) => opt.name.toLowerCase().includes(q))
            .slice(0, 20)
        : allOptions
    );
  };

  /* ---------------------------- 3️⃣ Stable positioning ---------------------------- */

  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null
  );

  // Track position reactively using requestAnimationFrame for stable rects
  useLayoutEffect(() => {
    let raf: number;
    const update = (anchorRef?: React.RefObject<HTMLElement>) => {
      if (!anchorRef?.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 6, left: rect.left });
    };

    // Poll every frame while menu is active (smooth repositions on text updates)
    const loop = (anchorRef?: React.RefObject<HTMLElement>) => {
      raf = requestAnimationFrame(() => {
        update(anchorRef);
        loop(anchorRef);
      });
    };

    return () => cancelAnimationFrame(raf);
  }, []);

  // Helper to update position on scroll/resize
  const updatePosition = (anchorEl?: HTMLElement | null) => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 6, left: rect.left });
  };

  useEffect(() => {
    const handler = () => updatePosition(document.activeElement as HTMLElement);
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, []);

  /* ---------------------------- 4️⃣ Render the menu ----------------------------- */

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

          // Add trailing space after mention
          const selection = $getSelection();
          if ($isRangeSelection(selection)) selection.insertText(" ");
        });
        closeMenu();
      }}
      menuRenderFn={(anchorRef, { selectedIndex, selectOptionAndCleanUp }) => {
        const anchorEl = anchorRef?.current;
        if (!anchorEl || filteredOptions.length === 0) return null;

        // Update menu position once the anchor is stable
        useLayoutEffect(() => {
          requestAnimationFrame(() => updatePosition(anchorEl));
        }, [anchorEl, filteredOptions]);

        if (!menuPos) return null;

        const style: React.CSSProperties = {
          ...menuStyle,
          position: "fixed", // ✅ viewport-safe, no scrollY addition
          top: menuPos.top,
          left: menuPos.left,
          zIndex: 9999,
        };

        const baseMenuClass =
          "max-h-[15rem] overflow-auto border rounded-md shadow-md bg-white text-sm";

        const menu = (
          <div className={`${baseMenuClass} ${menuClassName}`} style={style}>
            {filteredOptions.map((option, i) => (
              <div
                key={option.key || option.id || i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectOptionAndCleanUp(option);
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

        return createPortal(menu, document.body);
      }}
    />
  );
}
