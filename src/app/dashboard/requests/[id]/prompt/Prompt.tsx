"use client";

import RichTextarea from "@/components/blocks/RichTextarea/index";
import SetupLayout from "@/components/layouts/SetupLayout";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

const CUSTOMERS = ["Acme Corp", "Globex", "Initech", "Soylent", "Umbrella"];
const CONNECTORS = [
  { name: "Slack", logo: "/images/slack.png" },
  { name: "Docusign", logo: "/images/docusign.png" },
  { name: "Gmail", logo: "/images/gmail.png" },
  { name: "Salesforce", logo: "/images/salesforce.png" },
];

interface PromptProps {
  prompt: string;
  promptRich: SerializedEditorState<SerializedLexicalNode> | null;
  customer: string;
  errors: { prompt?: string; customer?: string };
  setPrompt: (val: string) => void;
  setPromptRich: (
    val: SerializedEditorState<SerializedLexicalNode> | null
  ) => void;
  setCustomer: (val: string) => void;
  onSubmit: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  onHome: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  status: "draft" | "active";
  setStatus?: (val: "draft" | "active") => void;
  mode: "create" | "edit" | "editDraft";
}

export default function Prompt({
  prompt,
  promptRich,
  customer,
  errors,
  setPrompt,
  setPromptRich,
  setCustomer,
  onSubmit,
  onCancel,
  onHome,
  onDelete,
  status,
  setStatus,
  mode,
}: PromptProps) {
  return (
    <SetupLayout
      // Sidebar
      sidebarBackText="Back to requests"
      onSidebarBack={onHome}
      sidebarTitle="Request data about your customer"
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
      title="What data do you want us to get for you?"
      subtitle="Explain what data you need with as many details as possible. We can get data from any data source you set up in connectors"
      // Footer
      primaryButtonText="Next"
      onPrimaryAction={onSubmit}
      secondaryButtonText="Cancel"
      onSecondaryAction={onCancel}
    >
      <div>
        <RichTextarea
          value={prompt}
          onChange={setPrompt}
          valueRich={promptRich}
          onChangeRich={setPromptRich}
          placeholder="Use @ symbols to tag connectors..."
          mentionOptions={CONNECTORS}
          className="mt-1 rounded-xl bg-white min-h-70"
        />

        {errors.prompt && (
          <p className="text-red-500 text-sm mt-1">{errors.prompt}</p>
        )}
      </div>

      <Select value={customer} onValueChange={setCustomer}>
        <SelectTrigger className="mt-4 w-full border border-grey-50 rounded-xl">
          <SelectValue placeholder="Which customer is this data for?">
            {customer ? (
              <span className="truncate">Customer: {customer}</span>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CUSTOMERS.map((cust) => (
            <SelectItem key={cust} value={cust}>
              {cust}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.customer && (
        <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
      )}
    </SetupLayout>
  );
}
