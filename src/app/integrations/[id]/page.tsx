"use client";

import { useRouter } from "next/navigation";
import Overview from "../../../dashboard/integrations/Overview";
import { integrations } from "../../../dashboard/integrations/DummyData";
import type { Integration } from "../../../dashboard/integrations/DummyData";
import { use } from "react";

interface Params {
  params: Promise<{ id: string }>;
}

export default function IntegrationOverviewPage({ params }: Params) {
  const router = useRouter();

  // Unwrap params Promise
  const resolvedParams = use(params);
  const integrationId = Number(resolvedParams.id);

  const integration = integrations.find((i) => i.id === integrationId);

  if (!integration) {
    return (
      <div className="p-10 text-center text-gray-500">
        Integration not found.
      </div>
    );
  }

  const handleBack = () => {
    router.push("/integrations");
  };

  const handleInstall = () => {
    alert(`Installed ${integration.title}! (Note: not saved on refresh)`);
    router.push("/integrations");
  };

  return (
    <Overview
      integration={integration as Integration}
      onBack={handleBack}
      onInstall={handleInstall}
    />
  );
}
