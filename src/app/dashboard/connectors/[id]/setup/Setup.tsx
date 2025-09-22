"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Connectors } from "../../DummyData";
import { useConnectorContext } from "@/lib/connectorContext";
import SetupLayout from "@/components/layouts//SetupLayout";

interface SetupProps {
  connector: Connectors;
}

export default function Setup({ connector }: SetupProps) {
  const router = useRouter();
  const { addConnector } = useConnectorContext();

  const [customName, setCustomName] = useState(connector.title);
  const [config, setConfig] = useState("");

  const handleCreate = () => {
    addConnector({
      ...connector,
      title: customName,
      status: "active",
      badge: "Billed Via Vercel",
      lastUpdated: "just now",
    });
    router.push("/dashboard/connectors");
  };

  return (
    <SetupLayout
      // Sidebar
      sidebarBackText="Back to connectors"
      onSidebarBack={() => router.push("/dashboard/connectors")}
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
      // Footer
      onFlowBack={() => router.push(`/dashboard/connectors/${connector.id}`)}
      primaryButtonText="Create"
      onSubmit={(e) => {
        e.preventDefault();
        handleCreate();
      }}
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
          onChange={(e) => setCustomName(e.target.value)}
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
          onChange={(e) => setConfig(e.target.value)}
          placeholder="Enter any configuration or notes here..."
        />
      </div>
    </SetupLayout>
  );
}
