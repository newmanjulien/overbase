"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import type { Integration } from "../../DummyData";
import { useIntegrationContext } from "../../../../../lib/integrationContext";

interface SetupProps {
  integration: Integration;
}

export default function Setup({ integration }: SetupProps) {
  const router = useRouter();
  const { addIntegration } = useIntegrationContext();

  const [customName, setCustomName] = useState(integration.title);
  const [config, setConfig] = useState("");

  // Handle create/install integration
  const handleCreate = () => {
    addIntegration({
      ...integration,
      title: customName,
      status: "active",
      badge: "Billed Via Vercel",
      lastUpdated: "just now",
    });
    router.push("/dashboard/integrations");
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Left Sidebar */}
      <aside className="w-56 bg-gray-50 border-r border-gray-200 p-6 flex flex-col">
        <button
          onClick={() =>
            router.push(`/dashboard/integrations/${integration.id}`)
          }
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
          aria-label="Back to Integration overview"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Integration</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          {/* You can replace this with logo image if you want */}
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {integration.title.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-semibold text-gray-900">
            {integration.title}
          </span>
        </div>

        <p className="text-sm text-gray-600">
          Configure your {integration.title} integration settings here.
        </p>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-3xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Installing into</span>
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <span>your projects</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Setup {integration.title}
          </h1>

          <p className="text-gray-600 max-w-md">
            Set up your {integration.title} integration to enhance your
            workflow. You can customize the name and add configuration notes
            below. Powered by{" "}
            <span className="inline-flex items-center gap-1">
              <span className="font-semibold">Your Platform</span>
              <ExternalLink className="w-3 h-3" />
            </span>
            .
          </p>
        </div>

        {/* Form Section */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          {/* Name Input */}
          <div className="mb-6">
            <label
              htmlFor="integration-name"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Name (*)
            </label>
            <input
              id="integration-name"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This name will be used to identify the integration in your
              dashboard.
            </p>
          </div>

          {/* Configuration textarea */}
          <div className="mb-10">
            <label
              htmlFor="integration-config"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Configuration
            </label>
            <textarea
              id="integration-config"
              rows={4}
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              placeholder="Enter any configuration or notes here..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              className="bg-transparent px-8"
              onClick={() =>
                router.push(`/dashboard/integrations/${integration.id}`)
              }
            >
              Back
            </Button>

            <Button
              type="submit"
              className="bg-black text-white px-8 hover:bg-black/90"
            >
              Create
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
