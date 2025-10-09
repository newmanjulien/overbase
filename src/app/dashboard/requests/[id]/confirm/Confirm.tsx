"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import SetupLayout from "@/components/layouts/SetupLayout";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

interface ConfirmProps {
  summary: string;
  setSummary: (v: string) => void;
  onSubmit: () => void | Promise<void>;
  onBack: () => void | Promise<void>;
  onHome: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  status: "draft" | "active";
  setStatus?: (val: "draft" | "active") => void;
  mode: "create" | "edit" | "editDraft";
  infoMessage?: string | null;
}

export default function Confirm({
  summary,
  setSummary,
  onSubmit,
  onBack,
  onHome,
  onDelete,
  status,
  setStatus,
  mode,
  infoMessage,
}: ConfirmProps) {
  const [isEditable, setIsEditable] = useState(false);

  // Temporary display formatting until the structured UI is in place.
  const displaySummary = useMemo(() => {
    if (isEditable) return summary;
    try {
      const parsed = JSON.parse(summary) as Array<{
        question: string;
        answer: string;
      }>;

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return summary;
      }

      return parsed
        .map(
          (item, index) =>
            `Q${index + 1}: ${item.question.trim()}\nA: ${item.answer.trim()}`,
        )
        .join("\n\n");
    } catch {
      return summary;
    }
  }, [summary, isEditable]);

  return (
    <SetupLayout
      sidebarBackText="Back to requests"
      onSidebarBack={onHome}
      sidebarTitle="Edit this summary of your request"
      {...(mode !== "create" &&
        setStatus && {
          sidebarActionText: "Delete request",
          onSidebarAction: onDelete,
          toggleValue: status,
          onToggleChange: (val) => void setStatus(val as "draft" | "active"),
          toggleOptions: [
            { value: "draft", label: "Draft" },
            { value: "active", label: "Active" },
          ],
        })}
      title="Did we understand correctly?"
      subtitle="This is a summary of what we understood from your request. Click edit if something is wrong"
      primaryButtonText="Done"
      onPrimaryAction={onSubmit}
      secondaryButtonText="Restart"
      onSecondaryAction={onBack}
    >
      <div className="relative">
        {infoMessage && (
          <p className="text-sm text-muted-foreground mb-3">{infoMessage}</p>
        )}
        <Textarea
          id="summary"
          value={displaySummary}
          onChange={(e) => setSummary(e.target.value)}
          readOnly={!isEditable}
          className={`mt-1 min-h-90 ${
            !isEditable ? "bg-gray-50 text-gray-400" : ""
          }`}
        />

        {!isEditable && (
          <div className="absolute bottom-2 right-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditable(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </SetupLayout>
  );
}
