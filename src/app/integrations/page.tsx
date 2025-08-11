"use client";

import { useRouter } from "next/navigation";
import { integrations } from "../../dashboard/integrations/DummyData";
import type { Integration } from "../../dashboard/integrations/DummyData";
import { PopularIntegrations } from "../../dashboard/integrations/PopularIntegrations";

export default function IntegrationsPage() {
  const router = useRouter();

  const handleBrowseClick = () => {
    // Optional browse click handler
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Integrations</h1>

      <PopularIntegrations
        popularIntegrations={integrations as Integration[]}
        onBrowseClick={handleBrowseClick}
      />
    </div>
  );
}
