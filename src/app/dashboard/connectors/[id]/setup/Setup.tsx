"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import type { Connectors } from "../../DummyData";
import { useConnectorContext } from "../../../../../lib/connectorContext";

interface SetupProps {
  connector: Connectors;
}

export default function Setup({ connector }: SetupProps) {
  const router = useRouter();
  const { addConnector } = useConnectorContext();

  const [customName, setCustomName] = useState(connector.title);
  const [config, setConfig] = useState("");

  // Handle create/install connector
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
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Left Sidebar */}
      <aside className="w-[28rem] bg-gray-100 border-r border-gray-200 pl-10 pr-15 pt-12 pb-6 flex flex-col">
        <button
          onClick={() => router.push(`/dashboard/connectors/${connector.id}`)}
          className="flex items-center gap-2 text-sm text-gray-600 mb-8"
          aria-label="Back to connector overview"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Connector</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          {/* You can replace this with logo image if you want */}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-10 pt-12 pb-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Setup {connector.title}
          </h1>

          <p className="text-sm text-gray-600">
            Set up your {connector.title} connector to enhance your workflow.
            You can customize the name and add configuration notes below.
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
              htmlFor="connector-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Name (*)
            </label>
            <input
              id="connector-name"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              maxLength={50}
              required
              className="
                w-full
                border border-gray-200/60
                rounded-sm
                px-3 py-1.5
                text-gray-700 text-sm
                placeholder:text-gray-400
                placeholder:font-light
                bg-white
                focus:outline-none focus:ring-2 focus:ring-grey-100/80 focus:border-transparent
                transition
                duration-150
                hover:bg-gray-50/80
              "
            />
            <p className="text-xs text-gray-500 mt-1">
              This name will be used to identify the connector in your
              dashboard.
            </p>
          </div>

          {/* Configuration textarea */}
          <div className="mb-10">
            <label
              htmlFor="connector-config"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Configuration
            </label>
            <textarea
              id="connector-config"
              rows={4}
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              placeholder="Enter any configuration or notes here..."
              className="
                w-full
                border border-gray-200/60
                rounded-sm
                px-3 py-1.5
                text-gray-700 text-sm
                placeholder:text-gray-400
                placeholder:font-light
                bg-white
                focus:outline-none focus:ring-2 focus:ring-grey-100/80 focus:border-transparent
                transition
                duration-150
                hover:bg-gray-50/80
                resize-none
              "
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              className="font-normal bg-white text-black border border-gray-200 hover:bg-gray-100"
              onClick={() =>
                router.push(`/dashboard/connectors/${connector.id}`)
              }
            >
              Back
            </Button>

            <Button
              type="submit"
              className="font-normal bg-black text-white hover:bg-black/90 border border-transparent"
            >
              Create
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
