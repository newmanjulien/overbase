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
      title="Did we understand correctly?"
      subtitle="This us a summary of what we understood from your request. But we might have misunderstood some of the details"
      // Footer (two buttons, required)
      primaryButtonText="Done"
      onPrimaryAction={onSubmit}
      secondaryButtonText="Restart"
      onSecondaryAction={onBack}
    >
      <div>
        <Label htmlFor="summary" className="mb-2">
          Edit our understanding
        </Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          grow
          className="mt-1 min-h-80"
        />
      </div>
    </SetupLayout>
  );
}
