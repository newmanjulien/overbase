"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { Connectors } from "../../DummyData";
import { useConnectorContext } from "@/lib/connectors/connectorContext";
import Setup from "./Setup";

interface SetupClientProps {
  connector: Connectors;
}

export default function SetupClient({ connector }: SetupClientProps) {
  const router = useRouter();
  const { addConnector } = useConnectorContext();

  const [customName, setCustomName] = useState(connector.title);
  const [config, setConfig] = useState("");

  const handleCreate = () => {
    addConnector({
      ...connector,
      title: customName,
      status: "active",
      badge: "Billed Via Vercel",
      lastUpdated: "just now",
    });
    router.push("/dashboard/connectors");
  };

  return (
    <Setup
      connector={connector}
      customName={customName}
      config={config}
      onCustomNameChange={setCustomName}
      onConfigChange={setConfig}
      onCreate={handleCreate}
      onBack={() => router.push("/dashboard/connectors")}
      onFlowBack={() => router.push(`/dashboard/connectors/${connector.id}`)}
    />
  );
}
