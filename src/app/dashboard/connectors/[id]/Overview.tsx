"use client";

import type { Connectors } from "../DummyData";
import { useRouter } from "next/navigation";
import { PreviewImages } from "./PreviewImages";
import { Header } from "../../../../components/Header";

interface OverviewProps {
  connector: Connectors;
  onBack?: () => void; // optional, fallback to router.back()
  onInstall: () => void;
}

export default function Overview({ connector, onBack }: OverviewProps) {
  const router = useRouter();

  const previewImages = connector.previewImages ?? [];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const resourceLinks = [
    "Support",
    "Documentation",
    "EULA",
    "Privacy Policy",
    "Website",
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Reusable Header component in "overview" mode */}
      <Header
        variant="overview"
        title={connector.title}
        showBackButton
        onBackClick={handleBack}
        logo={connector.logo}
        actionButtonLabel="Install"
        onActionButtonClick={() =>
          router.push(`/dashboard/connectors/${connector.id}/setup`)
        }
      />

      <div className="max-w-7xl mx-auto flex gap-8 px-6 py-10">
        {/* Sidebar */}
        <aside className="w-56 p-8">
          <div className="space-y-12">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Installs
              </h3>
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
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10">
          <div className="space-y-16 max-w-4xl mx-auto">
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

            {previewImages.length > 0 && (
              <PreviewImages images={previewImages} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
