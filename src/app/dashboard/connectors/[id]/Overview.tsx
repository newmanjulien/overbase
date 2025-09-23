"use client";

import type { Connectors } from "../DummyData";
import { PreviewImages } from "../../../../components/blocks/PreviewImages";
import { Header } from "@/components/blocks/Header";
import OverviewLayout from "@/components//layouts/OverviewLayout";

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

  return (
    <div className="min-h-screen">
      {/* Header at top */}
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

      <OverviewLayout
        installs={connector.installs}
        categories={connector.categories}
        type={connector.type}
        resources={connector.resources}
        status={connector.status}
      >
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-8">Overview</h2>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-md">
              {connector.title} is a powerful connector designed to enhance your
              workflow. It offers seamless capabilities and reliable
              performance.
            </p>
            <p className="text-md">
              Integrate {connector.title} into your projects to unlock new
              features and streamline your development experience.
            </p>
          </div>
        </section>

        {previewImages.length > 0 && <PreviewImages images={previewImages} />}
      </OverviewLayout>
    </div>
  );
}
