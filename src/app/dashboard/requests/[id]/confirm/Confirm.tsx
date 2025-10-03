"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SetupLayout from "@/components/layouts/SetupLayout";

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
}: ConfirmProps) {
  return (
    <SetupLayout
      // Sidebar
      sidebarBackText="Back to requests"
      onSidebarBack={onHome}
      sidebarTitle="Answer 3 short questions"
      // Conditional UI elements
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
      // Main
      title="Answer 3 questions"
      subtitle="Provide details to complete your request."
      // Footer (two buttons, required)
      primaryButtonText="Submit"
      onPrimaryAction={onSubmit}
      secondaryButtonText="Back"
      onSecondaryAction={onBack}
    >
      <div>
        <Label htmlFor="summary" className="mb-2">
          Summary
        </Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          grow
          className="mt-1 min-h-60"
        />
      </div>
    </SetupLayout>
  );
}
