"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Connectors } from "../../DummyData";
import { useConnectorContext } from "@/lib/connectorContext";

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
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <aside className="w-[28rem] bg-gray-100 border-r border-gray-200 pl-14 pr-15 pt-12 pb-6 flex flex-col">
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => router.push("/dashboard/connectors")}
            variant="backLink"
            size="backLink"
            leadingIcon={<ChevronLeft className="w-5 h-5" />}
          >
            Back to connectors
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {connector.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-2xl font-semibold text-gray-900 leading-tight">
              <div>Get started with</div>
              <div>{connector.title}</div>
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-10 pt-12 pb-6">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Setup {connector.title}
          </h1>
          <p className="text-sm text-gray-600">
            Set up your {connector.title} connector to enhance your workflow.
            You can customize the name and add configuration notes below.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <div className="mb-6">
            <label
              htmlFor="connector-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name (*)
            </label>
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
              This name will be used to identify the connector in your
              dashboard.
            </p>
          </div>

          <div className="mb-10">
            <label
              htmlFor="connector-config"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Configuration
            </label>
            <Textarea
              id="connector-config"
              rows={4}
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              placeholder="Enter any configuration or notes here..."
            />
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(`/dashboard/connectors/${connector.id}`)
              }
            >
              Back
            </Button>

            <Button type="submit">Create</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
