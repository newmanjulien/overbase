"use client";

import { connectors } from "./DummyData";
import { useConnectorContext } from "@/lib/connectorContext";
import { Connectors } from "./Connectors";
import type { Connectors as ConnectorType } from "./DummyData";

export default function ConnectorsClient() {
  const { addedConnectors } = useConnectorContext();

  // Exclude added connectors from popular list
  const popularConnectors = connectors.filter(
    (connector) => !addedConnectors.some((added) => added.id === connector.id)
  );

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
      addedConnectors={addedConnectors}
      popularConnectors={popularConnectors}
      onBrowseClick={handleBrowseClick}
      onManageConnector={handleManageConnector}
    />
  );
}
