"use client";

import { useRouter } from "next/navigation";
import Overview from "./Overview";
import type { Connectors } from "../DummyData";

interface OverviewClientProps {
  connector: Connectors;
}

export default function OverviewClient({ connector }: OverviewClientProps) {
  const router = useRouter();

  return (
    <Overview
      connector={connector}
      onBack={() => router.push("/dashboard/connectors")}
      onInstall={() =>
        router.push(`/dashboard/connectors/${connector.id}/setup`)
      }
    />
  );
}
