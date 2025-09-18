"use client";

import { useRouter } from "next/navigation";
import { RowCard } from "../../../components/ui/RowCard";
import { EmptyState } from "../../../components/ui/EmptyState";
import { PopularIntegrations } from "./PopularIntegrations";
import type { Integration } from "./DummyData";
import { integrations } from "./DummyData";
import { useIntegrationContext } from "../../../lib/integrationContext";
import { Header } from "../../../components/ui/Header";

export default function IntegrationsPage() {
  const router = useRouter();
  const { installedIntegrations } = useIntegrationContext();

  const popularIntegrations = integrations.filter(
    (integration) =>
      !installedIntegrations.some(
        (installed) => installed.id === integration.id
      )
  );

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

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          {/* Installed Integrations */}
          <div className="flex-1 flex flex-col gap-2">
            {installedIntegrations.length === 0 ? (
              <EmptyState
                title="No Integrations Installed"
                description="You don't have any integration installed."
                buttonLabel="Browse integrations"
                onButtonClick={handleBrowseClick}
                className="py-32 min-h-[600px]"
                withBorder={true}
                iconType="plug"
              />
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
                />
              ))
            )}
          </div>

          {/* Popular Integrations */}
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
