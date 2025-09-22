"use client";

import type { Connectors } from "../DummyData";
import { PreviewImages } from "./PreviewImages";
import { Header } from "@/components/blocks/Header";

interface OverviewProps {
  connector: Connectors;
  onBack: () => void;
  onInstall: () => void;
}

export default function Overview({
  connector,
  onBack,
  onInstall,
}: OverviewProps) {
  const previewImages = connector.previewImages ?? [];
  const resourceLinks = [
    "Support",
    "Documentation",
    "EULA",
    "Privacy Policy",
    "Website",
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header
        title={connector.title}
        logo={connector.logo}
        backlink
        backlinkLabel="Back to connectors"
        onBacklinkClick={onBack}
        buttonLabel="Install"
        onButtonClick={onInstall}
        buttonVariant="default"
      />

      {/* Main layout with grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-[220px_1fr] gap-8 px-6 py-10">
        {/* Sidebar */}
        <aside className="space-y-12">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Installs</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {connector.status === "active" ? (
                <span className="font-semibold">Installed</span>
              ) : (
                <span>{"<500 installs"}</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Categories
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Experimentation
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Type</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Vercel Native
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-6">
              Resources
            </h3>
            <div className="space-y-4">
              {resourceLinks.map((label) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="space-y-16 max-w-4xl">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-8">
              Overview
            </h2>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-md">
                {connector.title} is a powerful connector designed to enhance
                your workflow. It offers seamless capabilities and reliable
                performance.
              </p>
              <p className="text-md">
                Integrate {connector.title} into your projects to unlock new
                features and streamline your development experience.
              </p>
            </div>
          </section>

          {previewImages.length > 0 && <PreviewImages images={previewImages} />}
        </main>
      </div>
    </div>
  );
}
