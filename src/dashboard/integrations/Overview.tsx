"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import type { Integration } from "./DummyData";

interface OverviewProps {
  integration: Integration;
  onBack: () => void;
  onInstall: (integration: Integration) => void;
}

export default function Overview({
  integration,
  onBack,
  onInstall,
}: OverviewProps) {
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const previewImages = integration.previewImages ?? [];

  useEffect(() => {
    if (previewImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPreviewIndex((prev) => (prev + 1) % previewImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [previewImages.length]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-[#FAFAFA] border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
          <div className="flex flex-col gap-2 max-w-[calc(100%-180px)]">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-600 text-sm font-base"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to integrations
            </button>
            <div className="flex items-center gap-4 mt-1">
              <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                <Image
                  src={integration.logo}
                  alt={integration.title}
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
              <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight">
                {integration.title}
              </h1>
            </div>
          </div>

          <div>
            <Button
              onClick={() => onInstall(integration)}
              variant="default"
              className="font-normal bg-black text-white hover:bg-black/90 border border-transparent"
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
                {integration.status === "active" ? (
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
                {[
                  "Support",
                  "Documentation",
                  "EULA",
                  "Privacy Policy",
                  "Website",
                ].map((label) => (
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
                  {integration.title} is a powerful integration designed to
                  enhance your workflow. It offers seamless capabilities and
                  reliable performance.
                </p>
                <p className="text-md">
                  Integrate {integration.title} into your projects to unlock new
                  features and streamline your development experience.
                </p>
              </div>
            </section>

            {previewImages.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-12">
                  Preview
                </h2>

                <div className="flex gap-4 items-start">
                  {/* Main preview image */}
                  <div
                    className="relative bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200"
                    style={{
                      height: "calc(4 * 6rem + 3 * 1rem)", // same height as thumbnails
                      aspectRatio: "16 / 10",
                    }}
                  >
                    <Image
                      src={previewImages[currentPreviewIndex].src}
                      alt={previewImages[currentPreviewIndex].alt}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Thumbnails container */}
                  <div
                    className="flex flex-col justify-between"
                    style={{
                      width: "12rem", // fixed width for each thumbnail
                      height: "calc(4 * 6rem + 3 * 1rem)", // total height including gaps
                    }}
                  >
                    {previewImages.map((image, index) => (
                      <div
                        key={image.id}
                        className={`relative bg-gray-100 rounded-md overflow-hidden cursor-pointer transition-all border-2 ${
                          index === currentPreviewIndex
                            ? "border-gray-800 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                        style={{
                          width: "12rem",
                          height: "6rem",
                          aspectRatio: "16 / 10",
                          marginBottom:
                            index < previewImages.length - 1 ? "0.5rem" : 0,
                        }}
                        onClick={() => setCurrentPreviewIndex(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            setCurrentPreviewIndex(index);
                        }}
                        aria-label={`Preview image ${index + 1}: ${image.alt}`}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
