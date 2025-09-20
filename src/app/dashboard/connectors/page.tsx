"use client";

import { useRouter } from "next/navigation";
import { RowCard } from "@/components/RowCard";
import { EmptyState } from "@/components/EmptyState";
import { PopularConnectors } from "./PopularConnectors";
import type { Connectors } from "./DummyData";
import { connectors } from "./DummyData";
import { useConnectorContext } from "@/lib/connectorContext";
import { Header } from "@/components/Header";

export default function ConnectorsPage() {
  const router = useRouter();
  const { installedConnectors } = useConnectorContext();

  const popularConnectors = connectors.filter(
    (connector) =>
      !installedConnectors.some((installed) => installed.id === connector.id)
  );

  const handleSelectConnector = (connector: Connectors) => {
    router.push(`/dashboard/connectors/${connector.id}`);
  };

  const handleBrowseClick = () => {
    const popularSection = document.getElementById("popular-connectors");
    if (popularSection) {
      popularSection.scrollIntoView({ behavior: "smooth" });
      popularSection.focus();
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <Header
        title="Connectors"
        subtitle="Set up connectors so we can automatically get data from all your sources."
        buttonLabel="Browse connectors"
        onButtonClick={() => {}}
        variant="white"
      />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          {/* Installed Connectors */}
          <div className="flex-1 flex flex-col gap-2">
            {installedConnectors.length === 0 ? (
              <EmptyState
                title="No Connectors Installed"
                description="You don't have any connector installed."
                buttonLabel="Browse connectors"
                onButtonClick={() => {}}
                className="py-32 min-h-[600px]"
                withBorder={true}
                iconType="plug"
              />
            ) : (
              installedConnectors.map((connector) => (
                <RowCard
                  key={connector.id}
                  title={connector.title}
                  subtitle={connector.subtitle}
                  image={connector.logo}
                  buttonLabel="Manage"
                  buttonOnClick={() =>
                    console.log(`Manage clicked for ${connector.title}`)
                  }
                  showGreenDot={connector.status === "active"}
                />
              ))
            )}
          </div>

          {/* Popular Connectors */}
          <PopularConnectors
            popularConnectors={popularConnectors}
            onAddConnector={handleSelectConnector}
            onBrowseClick={handleBrowseClick}
          />
        </div>
      </div>
    </div>
  );
}
