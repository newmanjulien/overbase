"use client";

import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import type { Connectors } from "../DummyData";
import { useRouter } from "next/navigation";
import { PreviewImages } from "./PreviewImages";

interface OverviewProps {
  connector: Connectors;
  onBack?: () => void; // optional, fallback to router.back()
  onInstall: () => void; // add this
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
      {/* Header */}
      <header className="bg-[#FAFAFA] border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
          <div className="flex flex-col gap-2 max-w-[calc(100%-180px)]">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-600 text-sm font-base"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to connectors
            </button>
            <div className="flex items-center gap-4 mt-1">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                <Image
                  src={connector.logo}
                  alt={connector.title}
                  width={35}
                  height={35}
                  className="object-contain"
                />
              </div>
              <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight">
                {connector.title}
              </h1>
            </div>
          </div>

          <div>
            <Button
              onClick={() =>
                router.push(`/dashboard/connectors/${connector.id}/setup`)
              }
              variant="default"
              className="font-normal rounded-xl bg-black text-white hover:bg-black/90 border border-transparent"
            >
              Install
            </Button>
          </div>
        </div>
      </header>

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
