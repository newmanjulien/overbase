"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import {
  KpiAttachment,
  FileAttachment,
  ConnectorReference,
  PersonReference,
} from "@/lib/questions";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// ============================================
// TYPES
// ============================================

interface AttachmentChipListProps {
  kpis?: KpiAttachment[];
  people?: PersonReference[];
  files?: (FileAttachment | { fileName: string; context?: string })[];
  connectors?: ConnectorReference[];
  // Optional remove callbacks - when provided, chips show X button
  onRemoveKpi?: (index: number) => void;
  onRemovePerson?: (index: number) => void;
  onRemoveFile?: (index: number) => void;
  onRemoveConnector?: (index: number) => void;
}

// ============================================
// ATTACHMENT CHIP (Stateless UI Primitive)
// ============================================

export interface AttachmentChipProps {
  icon?: ReactNode;
  label: string;
  onRemove?: () => void; // Optional - when omitted, chip is read-only (no X button)
}

export function AttachmentChip({ icon, label, onRemove }: AttachmentChipProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-gray-800">
      {icon && icon}
      <span className="max-w-[200px] truncate">{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-800 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ============================================
// HELPER: Build chip data array
// ============================================

interface ChipData {
  key: string;
  icon?: ReactNode;
  label: string;
  onRemove?: () => void;
}

function buildChipData(props: AttachmentChipListProps): ChipData[] {
  const chips: ChipData[] = [];

  props.kpis?.forEach((kpi, idx) => {
    chips.push({
      key: `kpi-${idx}`,
      label: kpi.metric,
      onRemove: props.onRemoveKpi ? () => props.onRemoveKpi!(idx) : undefined,
    });
  });

  props.people?.forEach((p, idx) => {
    const initials =
      p.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";

    chips.push({
      key: `person-${idx}`,
      icon: (
        <Avatar className="h-3.5 w-3.5">
          {p.photo && <AvatarImage src={p.photo} />}
          <AvatarFallback className="text-[8px] bg-gray-200">
            {initials}
          </AvatarFallback>
        </Avatar>
      ),
      label: p.name,
      onRemove: props.onRemovePerson
        ? () => props.onRemovePerson!(idx)
        : undefined,
    });
  });

  props.files?.forEach((f, idx) => {
    chips.push({
      key: `file-${idx}`,
      label: f.fileName,
      onRemove: props.onRemoveFile ? () => props.onRemoveFile!(idx) : undefined,
    });
  });

  props.connectors?.forEach((c, idx) => {
    chips.push({
      key: `connector-${idx}`,
      icon: (
        <img
          src={c.logo}
          alt=""
          className="h-3.5 w-3.5 rounded-sm object-contain"
        />
      ),
      label: c.title,
      onRemove: props.onRemoveConnector
        ? () => props.onRemoveConnector!(idx)
        : undefined,
    });
  });

  return chips;
}

// ============================================
// COMPONENT
// ============================================

const MAX_COLLAPSED_HEIGHT = 56; // ~2 rows of chips

export function AttachmentChipList(props: AttachmentChipListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const chips = buildChipData(props);

  // Measure if content overflows 2 rows
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      const scrollHeight = container.scrollHeight;
      setNeedsCollapse(scrollHeight > MAX_COLLAPSED_HEIGHT);
    };

    // Initial check
    checkOverflow();

    // Watch for size changes
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(container);

    return () => observer.disconnect();
  }, [chips.length]);

  // Nothing to render
  if (chips.length === 0) return null;

  return (
    <div className="mt-3">
      <div
        ref={containerRef}
        className="flex flex-wrap gap-2 overflow-hidden transition-all duration-200"
        style={{
          maxHeight:
            isExpanded || !needsCollapse ? "none" : `${MAX_COLLAPSED_HEIGHT}px`,
        }}
      >
        {chips.map((chip) => (
          <AttachmentChip
            key={chip.key}
            icon={chip.icon}
            label={chip.label}
            onRemove={chip.onRemove}
          />
        ))}
      </div>

      {/* Expand/collapse button */}
      {needsCollapse && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              See more
            </>
          )}
        </button>
      )}
    </div>
  );
}
