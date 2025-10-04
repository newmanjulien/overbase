"use client";

import { connectors } from "./DummyData";
import { useConnectorContext } from "@/lib/connectorContext";
import { Connectors } from "./Connectors";
import type { Connectors as ConnectorType } from "./DummyData";

export default function ConnectorsClient() {
  const { addedConnectors } = useConnectorContext();

  // Exclude added connectors from installed list
  const installedConnectors = connectors.filter(
    (connector) => !addedConnectors.some((added) => added.id === connector.id)
  );

  const handleBrowseClick = () => {
    const installedSection = document.getElementById("installed-connectors");
    if (installedSection) {
      installedSection.scrollIntoView({ behavior: "smooth" });
      installedSection.focus();
    }
  };

  const handleManageConnector = (connector: ConnectorType) => {
    console.log(`Manage clicked for ${connector.title}`);
  };

  return (
    <Connectors
      addedConnectors={addedConnectors}
      installedConnectors={installedConnectors}
      onBrowseClick={handleBrowseClick}
      onManageConnector={handleManageConnector}
    />
  );
}
