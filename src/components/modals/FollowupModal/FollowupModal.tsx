"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Privacy } from "@/lib/questions";
import { ASSET_KEYS } from "@/lib/assets";
import {
  X,
  BarChart3,
  Users,
  Upload,
  ChevronDown,
  Play,
  FileText,
  Lock,
  Plug,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AttachmentChip } from "../shared/AttachmentChip";
import KpiModal from "../KpiModal/KpiModal";
import PeopleModal from "../PeopleModal/PeopleModal";
import FileModal from "../FileModal/FileModal";
import ConnectorModal from "../ConnectorModal/ConnectorModal";
import type {
  KpiAttachment,
  PersonAttachmentWithInfo,
  FileAttachmentForUpload,
  ConnectorAttachment,
} from "../shared/modalTypes";

interface FollowupModalProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: Id<"questions">;
}

export default function FollowupModal({
  isOpen,
  onClose,
  threadId,
}: FollowupModalProps) {
  // User avatar
  const userAvatarAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.USER_AVATAR,
  });
  const userAvatar = userAvatarAsset?.imageUrl ?? null;

  // Form state
  const [question, setQuestion] = useState("");
  const [visibility, setVisibility] = useState<"Private" | "Team">("Private");

  // Attachment state
  const [kpis, setKpis] = useState<KpiAttachment[]>([]);
  const [people, setPeople] = useState<PersonAttachmentWithInfo[]>([]);
  const [fileAttachments, setFileAttachments] = useState<
    FileAttachmentForUpload[]
  >([]);

  // Nested modal state
  const [activeNestedModal, setActiveNestedModal] = useState<
    "kpi" | "people" | "file" | "connector" | null
  >(null);

  // Connector state
  const [connectors, setConnectors] = useState<ConnectorAttachment[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createAnswer = useMutation(
    api.features.questions.mutations.createAnswer
  );

  const handleSubmit = async () => {
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createAnswer({
        questionThreadId: threadId,
        sender: "user",
        content: question.trim(),
        privacy: visibility.toLowerCase() as Privacy,
        attachedKpis: kpis.length > 0 ? kpis : undefined,
        attachedPeople:
          people.length > 0
            ? people.map((p) => ({ id: p.name, name: p.name }))
            : undefined,
        attachedFiles:
          fileAttachments.length > 0
            ? fileAttachments.map((f) => ({
                fileName: f.fileName,
                context: f.context || undefined,
              }))
            : undefined,
        attachedConnectors:
          connectors.length > 0
            ? connectors.map((c) => ({
                id: c.id,
                title: c.title,
                logo: c.logo,
              }))
            : undefined,
      });

      // Reset form and close
      setQuestion("");
      setKpis([]);
      setPeople([]);
      setFileAttachments([]);
      setConnectors([]);
      onClose();
    } catch (error) {
      console.error("Failed to create follow-up:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeNestedModal = () => setActiveNestedModal(null);

  const removeKpi = (index: number) => {
    setKpis((prev) => prev.filter((_, i) => i !== index));
  };

  const removePeople = (index: number) => {
    setPeople((prev) => prev.filter((_, i) => i !== index));
  };

  const removeFileAttachment = (index: number) => {
    setFileAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeConnector = (index: number) => {
    setConnectors((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center pt-22 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl min-h-[calc(100vh-11rem)] flex flex-col">
        {/* Header */}
        <div className="relative py-4 px-4 flex items-center border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main content */}
        <div className="p-6 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4">
            <Avatar className="h-6 w-6">
              <AvatarImage src={userAvatar ?? undefined} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Play className="h-4 w-4 text-gray-600 fill-gray-600" />
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
          </div>

          <textarea
            autoFocus
            placeholder="Ask a follow up question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full flex-1 text-gray-700 placeholder:text-gray-400 border-0 resize-none focus:outline-none focus:ring-0"
          />

          {/* Attachment chips */}
          {(kpis.length > 0 ||
            people.length > 0 ||
            fileAttachments.length > 0 ||
            connectors.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4 max-h-20 overflow-y-auto">
              {kpis.map((kpi, idx) => (
                <AttachmentChip
                  key={`kpi-${idx}`}
                  icon={<BarChart3 className="h-3.5 w-3.5" />}
                  label={kpi.metric}
                  onRemove={() => removeKpi(idx)}
                />
              ))}
              {people.map((p, idx) => (
                <AttachmentChip
                  key={`people-${idx}`}
                  icon={<Users className="h-3.5 w-3.5" />}
                  label={p.name}
                  onRemove={() => removePeople(idx)}
                />
              ))}
              {fileAttachments.map((f, idx) => (
                <AttachmentChip
                  key={`file-${idx}`}
                  icon={<FileText className="h-3.5 w-3.5" />}
                  label={f.fileName}
                  onRemove={() => removeFileAttachment(idx)}
                />
              ))}
              {connectors.map((c, idx) => (
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
                  onRemove={() => removeConnector(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="p-2 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveNestedModal("kpi")}
              title="Define KPIs/Metrics"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <BarChart3 className="h-4.5 w-4.5 text-gray-700 hover:text-gray-900" />
            </button>
            <button
              onClick={() => setActiveNestedModal("people")}
              title="Link People"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="h-4.5 w-4.5 text-gray-700 hover:text-gray-900" />
            </button>
            <button
              onClick={() => setActiveNestedModal("file")}
              title="Attach File"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Upload className="h-4.5 w-4.5 text-gray-700 hover:text-gray-900" />
            </button>
            <button
              onClick={() => setActiveNestedModal("connector")}
              title="Add Connectors"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Plug className="h-4.5 w-4.5 text-gray-700 hover:text-gray-900" />
            </button>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!question.trim() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>

        {/* Nested Modals */}
        <KpiModal
          isOpen={activeNestedModal === "kpi"}
          onClose={closeNestedModal}
          kpis={kpis}
          setKpis={setKpis}
        />
        <PeopleModal
          isOpen={activeNestedModal === "people"}
          onClose={closeNestedModal}
          people={people}
          setPeople={setPeople}
        />
        <FileModal
          isOpen={activeNestedModal === "file"}
          onClose={closeNestedModal}
          fileAttachments={fileAttachments}
          setFileAttachments={setFileAttachments}
        />
        <ConnectorModal
          isOpen={activeNestedModal === "connector"}
          onClose={closeNestedModal}
          connectors={connectors}
          setConnectors={setConnectors}
        />
      </div>
    </div>
  );
}
