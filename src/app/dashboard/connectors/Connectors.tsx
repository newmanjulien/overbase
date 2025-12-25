"use client";

import { Header } from "@/components/blocks/Header";
import { RowCard } from "@/components/blocks/RowCard";
import { EmptyState } from "@/components/blocks/EmptyState";
import { InstalledConnectors } from "./InstalledConnectors";
import { Plug } from "lucide-react";
import type { Connectors } from "./DummyData";

interface ConnectorsProps {
  addedConnectors: Connectors[];
  installedConnectors: Connectors[];
  onManageConnector: (connector: Connectors) => void;
}

export function Connectors({
  addedConnectors,
  installedConnectors,
  onManageConnector,
}: ConnectorsProps) {
  return (
    <div className="min-h-[calc(100vh-56px)] w-full">
      <Header
        title="Connectors"
        subtitle="Add connectors to internal datasources you want to request data from."
        buttonLabel="Add custom connector"
        onButtonClick={() => {}}
        secondButtonLabel="Browse connectors"
        onSecondButtonClick={() => {}}
        buttonVariant="outline"
        learnMoreLink="#"
      />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          {/* Added Connectors */}
          <div className="flex-1 flex flex-col gap-2">
            {addedConnectors.length === 0 ? (
              <EmptyState
                title="No connectors added"
                description="You haven't added any connectors"
                buttonLabel="Browse connectors"
                onButtonClick={() => {}}
                className="py-32 min-h-[600px]"
                withBorder={true}
                icon={Plug}
              />
            ) : (
              addedConnectors.map((connector) => (
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

          {/* Installed Connectors */}
          <InstalledConnectors
            installedConnectors={installedConnectors}
            onSeeAllClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
