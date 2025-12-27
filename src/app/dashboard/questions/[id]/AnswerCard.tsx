"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ASSET_KEYS } from "@/lib/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Lock, Users, MoreHorizontal, BarChart3, FileText } from "lucide-react";
import DataTable from "@/components/blocks/DataTable";
import { AttachmentChip } from "@/components/modals/shared/AttachmentChip";
import {
  SENDER_LABEL,
  type Privacy,
  type Sender,
  type KpiAttachment,
  type PersonReference,
  type FileAttachment,
  type ConnectorReference,
  type TableRow,
} from "@/lib/questions";

// ============================================
// PROP TYPES (discriminated union)
// ============================================

/** Props for question card variant */
type QuestionCardProps = {
  type: "question";
  content: string;
  date: string;
  privacy: Privacy;
  onPrivacyChange: (newPrivacy: Privacy) => void;
  onForward: () => void;
  // Attachments from the original question
  attachedKpis?: KpiAttachment[];
  attachedPeople?: PersonReference[];
  attachedFiles?: FileAttachment[];
  attachedConnectors?: ConnectorReference[];
};

/** Props for answer card variant */
type AnswerCardVariantProps = {
  type: "response";
  answerId: string;
  sender: Sender;
  content: string;
  privacy: Privacy;
  tableData?: TableRow[];
  onPrivacyChange: (newPrivacy: Privacy) => void;
  onForward: () => void;
  showMenu?: boolean;
  // Attachments (only for user messages)
  attachedKpis?: KpiAttachment[];
  attachedPeople?: PersonReference[];
  attachedFiles?: FileAttachment[];
  attachedConnectors?: ConnectorReference[];
};

/** Props for status card variant (e.g., "Overbase is answering...") */
type StatusCardProps = {
  type: "status";
  label: string;
  subLabel?: string;
  avatar: "overbase";
};

/** Discriminated union of all card variants */
export type AnswerCardProps =
  | QuestionCardProps
  | AnswerCardVariantProps
  | StatusCardProps;

// ============================================
// COMPONENT
// ============================================

export default function AnswerCard(props: AnswerCardProps) {
  // Fetch avatar assets
  const userAvatarAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.USER_AVATAR,
  });
  const overbaseIconAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.OVERBASE_ICON,
  });
  const userAvatar = userAvatarAsset?.imageUrl ?? null;
  const overbaseIcon = overbaseIconAsset?.imageUrl ?? null;

  // Derive display values based on card type
  const derived = deriveDisplayValues(props, userAvatar, overbaseIcon);

  const handlePrivacyClick = () => {
    if (props.type === "status") return; // Status cards don't have privacy
    const newPrivacy = derived.privacy === "private" ? "team" : "private";
    props.onPrivacyChange(newPrivacy);
  };

  // Show menu for answer cards from user when showMenu prop is true
  const showMenu = props.type === "response" && props.showMenu;

  // Cancel answer mutation - only initialize if menu is shown
  const cancelAnswer = useMutation(
    api.features.questions.mutations.cancelAnswer
  );

  const handleCancelAnswer = () => {
    if (props.type === "response") {
      cancelAnswer({ id: props.answerId as Id<"answers"> });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      <div className="p-4">
        {/* Header: avatar + labels + menu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={derived.avatar ?? undefined} />
              <AvatarFallback>{derived.avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm text-gray-700">{derived.topLabel}</span>
              <div className="flex items-center gap-1.5">
                {derived.subLabel && (
                  <span className="text-xs text-gray-400">
                    {derived.subLabel}
                  </span>
                )}
                {derived.subLabel && derived.privacy && (
                  <span className="text-gray-300 text-[10px]">·</span>
                )}
                {derived.privacy && (
                  <button
                    type="button"
                    onClick={handlePrivacyClick}
                    className="text-gray-400 text-xs capitalize hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {derived.privacy === "private" ? (
                      <Lock size={11} className="shrink-0" />
                    ) : (
                      <Users size={11} className="shrink-0" />
                    )}
                    {derived.privacy}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Menu for cancel action */}
          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleCancelAnswer}
                  className="text-red-600 focus:text-red-600 focus:bg-red-100"
                >
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Main content */}
        {derived.content && (
          <div className="text-sm text-gray-800 mt-3">
            <p className="text-gray-700 text-sm leading-relaxed">
              {derived.content}
            </p>
          </div>
        )}

        {/* Attachment chips (for user question and follow-up messages) */}
        {(derived.attachedKpis?.length ||
          derived.attachedPeople?.length ||
          derived.attachedFiles?.length ||
          derived.attachedConnectors?.length) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {derived.attachedKpis?.map((kpi, idx) => (
              <AttachmentChip
                key={`kpi-${idx}`}
                icon={<BarChart3 className="h-3.5 w-3.5" />}
                label={kpi.metric}
              />
            ))}
            {derived.attachedPeople?.map((p, idx) => (
              <AttachmentChip
                key={`people-${idx}`}
                icon={<Users className="h-3.5 w-3.5" />}
                label={p.name}
              />
            ))}
            {derived.attachedFiles?.map((f, idx) => (
              <AttachmentChip
                key={`file-${idx}`}
                icon={<FileText className="h-3.5 w-3.5" />}
                label={f.fileName}
              />
            ))}
            {derived.attachedConnectors?.map((c, idx) => (
              <AttachmentChip
                key={`connector-${idx}`}
                icon={
                  <img
                    src={c.logo}
                    alt=""
                    className="h-3.5 w-3.5 rounded-sm object-contain"
                  />
                }
                label={c.title}
              />
            ))}
          </div>
        )}
      </div>

      {/* Table content */}
      {derived.tableData && (
        <DataTable
          tableData={derived.tableData}
          onForward={props.type !== "status" ? props.onForward : undefined}
        />
      )}
    </div>
  );
}

// ============================================
// HELPER: Derive display values from props
// ============================================

interface DerivedValues {
  topLabel: string;
  subLabel?: string;
  content?: string;
  privacy?: Privacy;
  avatar: string | null;
  avatarFallback: string;
  tableData?: TableRow[];
  // Attachments (for user messages)
  attachedKpis?: KpiAttachment[];
  attachedPeople?: PersonReference[];
  attachedFiles?: FileAttachment[];
  attachedConnectors?: ConnectorReference[];
}

function deriveDisplayValues(
  props: AnswerCardProps,
  userAvatar: string | null,
  overbaseIcon: string | null
): DerivedValues {
  switch (props.type) {
    case "question":
      return {
        topLabel: "You asked",
        subLabel: props.date,
        content: props.content,
        privacy: props.privacy,
        avatar: userAvatar,
        avatarFallback: "U",
        attachedKpis: props.attachedKpis,
        attachedPeople: props.attachedPeople,
        attachedFiles: props.attachedFiles,
        attachedConnectors: props.attachedConnectors,
      };

    case "response":
      return {
        topLabel: SENDER_LABEL[props.sender],
        subLabel: undefined, // Could add timestamp here later
        content: props.content,
        privacy: props.privacy,
        avatar: props.sender === "user" ? userAvatar : overbaseIcon,
        avatarFallback: props.sender === "user" ? "U" : "AI",
        tableData: props.tableData,
        // Pass attachments only for user messages
        ...(props.sender === "user" && {
          attachedKpis: props.attachedKpis,
          attachedPeople: props.attachedPeople,
          attachedFiles: props.attachedFiles,
          attachedConnectors: props.attachedConnectors,
        }),
      };

    case "status":
      return {
        topLabel: props.label,
        subLabel: props.subLabel,
        content: undefined,
        privacy: undefined,
        avatar: overbaseIcon, // Status cards always use Overbase avatar
        avatarFallback: "AI",
      };
  }
}
