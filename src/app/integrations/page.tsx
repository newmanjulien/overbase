"use client";

import { useRouter } from "next/navigation";
import { integrations } from "../../dashboard/integrations/DummyData";
import type { Integration } from "../../dashboard/integrations/DummyData";
import { PopularIntegrations } from "../../dashboard/integrations/PopularIntegrations";

export default function IntegrationsPage() {
  const router = useRouter();

  const handleBrowseClick = () => {
    // Optional browse click handler (scroll or whatever)
    const popularSection = document.getElementById("popular-integrations");
    if (popularSection) {
      popularSection.scrollIntoView({ behavior: "smooth" });
      popularSection.focus();
    }
  };

  const handleAddIntegration = (integration: Integration) => {
    // For now, just log or navigate to overview, depending on your app needs
    console.log("Add integration clicked:", integration);
    // For example, navigate to integration overview page:
    router.push(`/integrations/${integration.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Integrations</h1>

      <PopularIntegrations
        popularIntegrations={integrations}
        onAddIntegration={handleAddIntegration}
        onBrowseClick={handleBrowseClick}
      />
    </div>
  );
}
