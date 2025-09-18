"use client";

import { useRouter } from "next/navigation";
import Overview from "./Overview";
import type { Connectors } from "../DummyData";

interface ClientWrapperProps {
  connector: Connectors;
}

export default function ClientWrapper({ connector }: ClientWrapperProps) {
  const router = useRouter();

  const handleInstall = () => {
    alert(`Installing ${connector.title}`);
  };

  return (
    <Overview
      connector={connector}
      onBack={() => router.push("/dashboard/connectors")}
      onInstall={handleInstall}
    />
  );
}
