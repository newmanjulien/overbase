"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Overview from "../../../dashboard/integrations/Overview";
import { integrations } from "../../../dashboard/integrations/DummyData";
import type { Integration } from "../../../dashboard/integrations/DummyData";

interface Params {
  params: { id: string };
}

export default function IntegrationOverviewPage({ params }: Params) {
  const router = useRouter();
  const [integration, setIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    const integrationId = Number(params.id);
    const found = integrations.find((i) => i.id === integrationId);
    if (found) {
      setIntegration(found);
    } else {
      setIntegration(null);
    }
  }, [params.id]);

  if (!integration) {
    return (
      <div className="p-10 text-center text-gray-500">
        Integration not found.
        <button
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => router.push("/integrations")}
        >
          Back to Integrations
        </button>
      </div>
    );
  }

  // We provide dummy no-op handlers for back and install
  const onBack = () => router.push("/integrations");
  const onInstall = (integration: Integration) => {
    // You can add logic here if you want, or just navigate back
    alert(`Installed ${integration.title} (dummy)`);
    router.push("/integrations");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Overview
        integration={integration}
        onBack={onBack}
        onInstall={onInstall}
      />
    </div>
  );
}
