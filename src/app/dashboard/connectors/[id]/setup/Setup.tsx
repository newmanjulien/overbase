"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Connectors } from "../../DummyData";
import SetupLayout from "@/components/layouts/SetupLayout";

interface SetupProps {
  connector: Connectors;
  customName: string;
  config: string;
  onCustomNameChange: (name: string) => void;
  onConfigChange: (config: string) => void;
  onCreate: () => void;
  onBack: () => void;
  onFlowBack: () => void;
}

export default function Setup({
  connector,
  customName,
  config,
  onCustomNameChange,
  onConfigChange,
  onCreate,
  onBack,
  onFlowBack,
}: SetupProps) {
  return (
    <SetupLayout
      // Sidebar
      sidebarBackText="Back to connectors"
      onSidebarBack={onBack}
      sidebarTitle={`Get started with ${connector.title}`}
      sidebarIcon={
        <div className="size-9 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {connector.title.charAt(0).toUpperCase()}
          </span>
        </div>
      }
      // Main
      title={`Setup ${connector.title}`}
      subtitle={`Set up your ${connector.title} connector to enhance your workflow. You can customize the name and add configuration notes below.`}
      // Footer (new API: 2 required buttons)
      primaryButtonText="Create"
      onPrimaryAction={onCreate}
      secondaryButtonText="Cancel"
      onSecondaryAction={onFlowBack}
    >
      {/* Children = form fields */}
      <div>
        <Label htmlFor="connector-name" className="mb-2 block">
          Name (*)
        </Label>
        <Input
          id="connector-name"
          type="text"
          value={customName}
          onChange={(e) => onCustomNameChange(e.target.value)}
          maxLength={50}
          required
          placeholder="Enter connector name"
        />
        <p className="text-xs text-gray-500 mt-1">
          This name will be used to identify the connector in your dashboard.
        </p>
      </div>

      <div>
        <Label htmlFor="connector-config" className="mb-2 block">
          Configuration
        </Label>
        <Textarea
          id="connector-config"
          rows={4}
          value={config}
          onChange={(e) => onConfigChange(e.target.value)}
          placeholder="Enter any configuration or notes here..."
        />
      </div>
    </SetupLayout>
  );
}
