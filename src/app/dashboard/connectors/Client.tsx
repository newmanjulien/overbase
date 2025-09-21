"use client";

import { useRouter } from "next/navigation";
import { connectors } from "./DummyData";
import { useConnectorContext } from "@/lib/connectorContext";
import { Connectors } from "./Connectors";
import type { Connectors as ConnectorType } from "./DummyData";

export default function ConnectorsClient() {
  const router = useRouter();
  const { installedConnectors } = useConnectorContext();

  // Exclude installed connectors from popular list
  const popularConnectors = connectors.filter(
    (connector) =>
      !installedConnectors.some((installed) => installed.id === connector.id)
  );

  const handleAddConnector = (connector: ConnectorType) => {
    router.push(`/dashboard/connectors/${connector.id}`);
  };

  const handleBrowseClick = () => {
    const popularSection = document.getElementById("popular-connectors");
    if (popularSection) {
      popularSection.scrollIntoView({ behavior: "smooth" });
      popularSection.focus();
    }
  };

  const handleManageConnector = (connector: ConnectorType) => {
    console.log(`Manage clicked for ${connector.title}`);
  };

  return (
    <Connectors
      installedConnectors={installedConnectors}
      popularConnectors={popularConnectors}
      onAddConnector={handleAddConnector}
      onBrowseClick={handleBrowseClick}
      onManageConnector={handleManageConnector}
    />
  );
}
