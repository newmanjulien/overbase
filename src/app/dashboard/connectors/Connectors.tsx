"use client";

import { Header } from "@/components/blocks/Header";
import { RowCard } from "@/components/blocks/RowCard";
import { EmptyState } from "@/components/blocks/EmptyState";
import { PopularConnectors } from "./PopularConnectors";
import type { Connectors } from "./DummyData";

interface ConnectorsProps {
  installedConnectors: Connectors[];
  popularConnectors: Connectors[];
  onBrowseClick: () => void;
  onManageConnector: (connector: Connectors) => void;
}

export function Connectors({
  installedConnectors,
  popularConnectors,
  onBrowseClick,
  onManageConnector,
}: ConnectorsProps) {
  return (
    <div className="min-h-screen">
      <Header
        title="Connectors"
        subtitle="Set up connectors to any data source so we can collect the data you request."
        buttonLabel="Browse connectors"
        onButtonClick={onBrowseClick}
        buttonVariant="outline"
        learnMoreLink="#"
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
                  showAvatar
                  buttonOnClick={() => onManageConnector(connector)}
                  showGreenDot={connector.status === "active"}
                />
              ))
            )}
          </div>

          {/* Popular Connectors */}
          <PopularConnectors
            popularConnectors={popularConnectors}
            onBrowseClick={onBrowseClick}
          />
        </div>
      </div>
    </div>
  );
}
