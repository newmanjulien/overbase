"use client";

import { useRouter } from "next/navigation";
import { RowCard } from "../../../components/ui/RowCard";
import { EmptyState } from "./EmptyState";
import { PopularIntegrations } from "./PopularIntegrations";
import type { Integration } from "./DummyData";
import { integrations } from "./DummyData";
import { useIntegrationContext } from "../../../lib/integrationContext";
import { Header } from "../../../components/ui/Header";

export function Integrations() {
  const router = useRouter();
  const { installedIntegrations } = useIntegrationContext();

  // Compute popular integrations dynamically based on installed ones
  const popularIntegrations = integrations.filter(
    (integration) =>
      !installedIntegrations.some(
        (installed) => installed.id === integration.id
      )
  );

  // Navigate to integration detail page
  const handleSelectIntegration = (integration: Integration) => {
    router.push(`/dashboard/integrations/${integration.id}`);
  };

  const handleBrowseClick = () => {
    const popularSection = document.getElementById("popular-integrations");
    if (popularSection) {
      popularSection.scrollIntoView({ behavior: "smooth" });
      popularSection.focus();
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <Header
        title="Integrations"
        subtitle="Set up integrations so you can use them in your workflows and so your AI can more easily help with tasks."
        buttonLabel="Browse integrations"
        onButtonClick={() => {}}
        variant="white"
      />

      {/* === Main Content Section === */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          {/* Left Section - Installed Integrations */}
          <div className="flex-1 flex flex-col gap-2">
            {installedIntegrations.length === 0 ? (
              <EmptyState onButtonClick={handleBrowseClick} />
            ) : (
              installedIntegrations.map((integration) => (
                <RowCard
                  key={integration.id}
                  title={integration.title}
                  subtitle={integration.subtitle}
                  image={integration.logo}
                  buttonLabel="Manage"
                  buttonOnClick={() =>
                    console.log(`Manage clicked for ${integration.title}`)
                  }
                  showGreenDot={integration.status === "active"}
                  buttonClassName="text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
                />
              ))
            )}
          </div>

          {/* Right Section - Popular Integrations */}
          <PopularIntegrations
            popularIntegrations={popularIntegrations}
            onAddIntegration={handleSelectIntegration}
            onBrowseClick={handleBrowseClick}
          />
        </div>
      </div>
    </div>
  );
}
