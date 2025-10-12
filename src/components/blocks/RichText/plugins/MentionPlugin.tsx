"use client";

import React, { useMemo, useState, useLayoutEffect } from "react";
import Image from "next/image";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { MenuRenderFn } from "@lexical/react/LexicalTypeaheadMenuPlugin";

import { createPortal } from "react-dom";
import { $createMentionNode } from "../nodes/MentionNode";
import { $getSelection, $isRangeSelection } from "lexical";

/* -------------------------------------------------------------------------- */
/*                              Utility / Classes                             */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type MentionOption = { id: string; name: string; logo?: string };
type MentionMenuOptionWithHidden = MentionMenuOption & { hidden: boolean };
type MenuRenderProps<T extends MenuOption> = Parameters<MenuRenderFn<T>>[1];

/* -------------------------------------------------------------------------- */
/*                            Utility React Hooks                             */
/* -------------------------------------------------------------------------- */

function useStableRect(anchorRef: React.RefObject<HTMLElement | null>) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      const el = anchorRef.current;
      if (el) setRect(el.getBoundingClientRect());
    };

    const observer = new ResizeObserver(update);
    if (anchorRef.current) observer.observe(anchorRef.current);

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    update(); // initialize once valid

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef]);

  return rect;
}

/* -------------------------------------------------------------------------- */
/*                              Dropdown Component                            */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                       ✅ New Lexical-Native Menu Wrapper                   */
/* -------------------------------------------------------------------------- */

function MentionMenuContainer({
  anchorRef,
  menuProps,
  menuClassName,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  menuProps: MenuRenderProps<MentionMenuOption>;
  menuClassName: string;
}) {
  const { selectedIndex, selectOptionAndCleanUp, options } = menuProps;
  const optionsWithHidden = options as MentionMenuOptionWithHidden[];
  const rect = useStableRect(anchorRef);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (rect && !ready) {
      requestAnimationFrame(() => setReady(true));
    }
  }, [rect, ready]);

  if (!rect || !ready) return null;

  return (
    <MentionDropdown
      options={optionsWithHidden.filter((o) => !o.hidden)}
      selectedIndex={selectedIndex ?? -1}
      onSelect={selectOptionAndCleanUp}
      anchorRect={rect}
      className={menuClassName}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                              Main Plugin Export                            */
/* -------------------------------------------------------------------------- */

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
    () =>
      mentionOptions.map((m) =>
        Object.assign(new MentionMenuOption(m), { hidden: false })
      ),
    [mentionOptions]
  );

  const triggerFn = (text: string) => {
    const match = /(^|\s)@([\p{L}\p{N}_-]{0,30})$/u.exec(text);
    if (!match) return null;
    return {
      leadOffset: match.index + match[1].length,
      matchingString: match[2],
      replaceableString: match[0].slice(match[1].length),
    };
  };

  if (typeof window === "undefined") return null;

  return (
    <LexicalTypeaheadMenuPlugin<MentionMenuOption>
      triggerFn={triggerFn}
      options={options}
      onQueryChange={(q) => {
        const query = (q || "").toLowerCase();
        options.forEach((o) => {
          o.hidden = query ? !o.name.toLowerCase().includes(query) : false;
        });
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
      /* 👇 This is now React-hooks-safe and Lexical-native */
      menuRenderFn={(anchorRef, menuProps) => (
        <MentionMenuContainer
          anchorRef={anchorRef}
          menuProps={menuProps}
          menuClassName={menuClassName}
        />
      )}
    />
  );
}
