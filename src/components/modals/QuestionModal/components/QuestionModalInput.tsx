"use client";

import { Users, ChevronDown, Play, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttachmentChipList } from "../../../blocks/AttachmentChipList";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ASSET_KEYS } from "@/lib/assets";
import type {
  KpiAttachment,
  PersonAttachmentWithInfo,
  FileAttachmentForUpload,
  ConnectorReference,
} from "../../types";

interface QuestionModalInputProps {
  question: string;
  setQuestion: (q: string) => void;
  visibility?: "Private" | "Team";
  setVisibility?: (v: "Private" | "Team") => void;
  kpis: KpiAttachment[];
  people: PersonAttachmentWithInfo[];
  fileAttachments: FileAttachmentForUpload[];
  connectors: ConnectorReference[];
  removeKpi: (index: number) => void;
  removePeople: (index: number) => void;
  removeFileAttachment: (index: number) => void;
  removeConnector: (index: number) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function QuestionModalInput({
  question,
  setQuestion,
  visibility,
  setVisibility,
  kpis,
  people,
  fileAttachments,
  connectors,
  removeKpi,
  removePeople,
  removeFileAttachment,
  removeConnector,
  placeholder = 'Start your question with "What", "How", "Why", etc.',
  autoFocus = true,
}: QuestionModalInputProps) {
  // User avatar
  const userAvatarAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.USER_AVATAR,
  });
  const userAvatar = userAvatarAsset?.imageUrl ?? null;

  return (
    <div className="p-6 flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-4">
        <Avatar className="h-6 w-6">
          <AvatarImage src={userAvatar ?? undefined} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <Play className="h-4 w-4 text-gray-600 fill-gray-600" />

        {visibility && setVisibility ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50">
                {visibility === "Private" ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                <span>{visibility}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setVisibility("Private")}>
                <Lock className="h-4 w-4 mr-2" />
                Private
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVisibility("Team")}>
                <Users className="h-4 w-4 mr-2" />
                Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-full text-sm text-gray-700 bg-gray-50">
            <Lock className="h-4 w-4" />
            <span className="text-gray-500">Private</span>
          </div>
        )}
      </div>

      <textarea
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full flex-1 text-gray-700 placeholder:text-gray-400 border-0 resize-none focus:outline-none focus:ring-0"
      />

      <AttachmentChipList
        kpis={kpis}
        people={people}
        files={fileAttachments}
        connectors={connectors}
        onRemoveKpi={removeKpi}
        onRemovePerson={removePeople}
        onRemoveFile={removeFileAttachment}
        onRemoveConnector={removeConnector}
      />
    </div>
  );
}
