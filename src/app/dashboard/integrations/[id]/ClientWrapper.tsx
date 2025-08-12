"use client";

import { useRouter } from "next/navigation";
import Overview from "./Overview";
import type { Integration } from "../DummyData";

interface ClientWrapperProps {
  integration: Integration;
}

export default function ClientWrapper({ integration }: ClientWrapperProps) {
  const router = useRouter();

  const handleInstall = () => {
    alert(`Installing ${integration.title}`);
  };

  return (
    <Overview
      integration={integration}
      onBack={() => router.back()}
      onInstall={handleInstall}
    />
  );
}
