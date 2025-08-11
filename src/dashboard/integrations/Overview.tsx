"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Shield,
  Globe,
  HelpCircle,
  Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import Image from "next/image";
import type { Integration } from "./DummyData";

interface OverviewProps {
  integration: Integration;
  onBack: () => void;
  onInstall: () => void;
}

export default function Overview({
  integration,
  onBack,
  onInstall,
}: OverviewProps) {
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  // Use previewImages from integration safely
  const previewImages = integration.previewImages || [];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPreviewIndex((prevIndex) =>
        previewImages.length === 0 ? 0 : (prevIndex + 1) % previewImages.length
      );
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [previewImages.length]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-12 py-6">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex flex-col gap-2">
            <button
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-xs self-start"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </button>
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                <div
                  className="w-3 h-3 bg-white"
                  style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }}
                />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                {integration.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 text-sm font-medium"
              onClick={onInstall}
            >
              Install
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium bg-transparent"
            >
              Deploy template
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1400px] mx-auto">
        {/* Sidebar */}
        <aside className="w-72 bg-[#FAFAFA] p-8">
          <div className="space-y-12">
            {/* Installs */}
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-4">
                Installs
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Download className="w-4 h-4" />
                {"<500 installs"}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-4">
                Categories
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Users className="w-4 h-4" />
                Experimentation
              </div>
            </div>

            {/* Type */}
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-4">Type</h3>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Vercel Native
              </div>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-6">
                Resources
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer">
                  <HelpCircle className="w-4 h-4" />
                  Support
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  Documentation
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer">
                  <FileText className="w-4 h-4" />
                  EULA
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer">
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 hover:text-gray-900 cursor-pointer">
                  <Globe className="w-4 h-4" />
                  Website
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-12 bg-[#FAFAFA]">
          <div className="space-y-16">
            {/* Overview Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-8">
                Overview
              </h2>
              <div className="space-y-6 text-gray-700 leading-relaxed max-w-4xl">
                <p className="text-sm">
                  {integration.subtitle} is the most popular open source feature
                  flag and experimentation platform, used at scale in production
                  by thousands of companies.
                </p>
                <p className="text-sm">
                  By integrating {integration.title} Cloud with Vercel, you can
                  view and manage all of your feature flags and experiments
                  directly in Vercel. You can also enable Edge Config sync for
                  near-zero initialization latency.
                </p>
              </div>
            </section>

            {/* Preview Section */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-12">
                Preview
              </h2>
              <div className="flex gap-8 items-start">
                {/* Large Preview Image */}
                <div className="flex-1 max-w-5xl">
                  <div className="relative aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                    {previewImages.length > 0 ? (
                      <Image
                        src={
                          previewImages[currentPreviewIndex].src ||
                          "/placeholder.svg"
                        }
                        alt={previewImages[currentPreviewIndex].alt}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No preview images available.
                      </div>
                    )}
                  </div>
                </div>

                {/* Small Preview Images */}
                <div
                  className="w-48 flex flex-col justify-between"
                  style={{ aspectRatio: "16/10" }}
                >
                  {previewImages.map((image, index) => (
                    <div
                      key={image.id}
                      className={`relative bg-gray-100 rounded-md overflow-hidden cursor-pointer transition-all border-2 ${
                        index === currentPreviewIndex
                          ? "border-blue-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                      style={{
                        height: "calc(25% - 9px)",
                        aspectRatio: "16/10",
                      }}
                      onClick={() => setCurrentPreviewIndex(index)}
                    >
                      <Image
                        src={image.src || "/placeholder.svg"}
                        alt={image.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
