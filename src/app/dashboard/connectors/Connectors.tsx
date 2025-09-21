"use client";

import { Header } from "@/components/Header";
import { RowCard } from "@/components/RowCard";
import { EmptyState } from "@/components/EmptyState";
import { PopularConnectors } from "./PopularConnectors";
import type { Connectors } from "./DummyData";

interface ConnectorsProps {
  installedConnectors: Connectors[];
  popularConnectors: Connectors[];
  onAddConnector: (connector: Connectors) => void;
  onBrowseClick: () => void;
  onManageConnector: (connector: Connectors) => void;
}

export function Connectors({
  installedConnectors,
  popularConnectors,
  onAddConnector,
  onBrowseClick,
  onManageConnector,
}: ConnectorsProps) {
  return (
    <div className="min-h-screen">
      <Header
        title="Connectors"
        subtitle="Set up connectors so we can automatically get data from all your sources."
        buttonLabel="Browse connectors"
        onButtonClick={onBrowseClick}
        buttonVariant="outline"
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
                onButtonClick={onBrowseClick}
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
                  buttonOnClick={() => onManageConnector(connector)}
                  showGreenDot={connector.status === "active"}
                />
              ))
            )}
          </div>

          {/* Popular Connectors */}
          <PopularConnectors
            popularConnectors={popularConnectors}
            onAddConnector={onAddConnector}
            onBrowseClick={onBrowseClick}
          />
        </div>
      </div>
    </div>
  );
}
