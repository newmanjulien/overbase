"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SetupLayout from "@/components/layouts/SetupLayout";

interface QuestionsProps {
  q1: string;
  q2: string;
  q3: string;
  setQ1: (v: string) => void;
  setQ2: (v: string) => void;
  setQ3: (v: string) => void;
  onSubmit: () => void | Promise<void>;
  onBack: () => void | Promise<void>;
  onHome: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  status: "draft" | "active";
  setStatus?: (val: "draft" | "active") => void;
  mode: "create" | "edit" | "editDraft";
}

export default function Questions({
  q1,
  q2,
  q3,
  setQ1,
  setQ2,
  setQ3,
  onSubmit,
  onBack,
  onHome,
  onDelete,
  status,
  setStatus,
  mode,
}: QuestionsProps) {
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
        <Label htmlFor="q1" className="mb-2">
          Question 1
        </Label>
        <Input id="q1" value={q1} onChange={(e) => setQ1(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="q2" className="mb-2">
          Question 2
        </Label>
        <Input id="q2" value={q2} onChange={(e) => setQ2(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="q3" className="mb-2">
          Question 3
        </Label>
        <Input id="q3" value={q3} onChange={(e) => setQ3(e.target.value)} />
      </div>
    </SetupLayout>
  );
}
