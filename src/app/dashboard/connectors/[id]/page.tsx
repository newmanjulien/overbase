import { connectors } from "../DummyData";
import ClientWrapper from "./Client";

interface ConnectorOverviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConnectorOverviewPage({
  params,
}: ConnectorOverviewPageProps) {
  const { id } = await params;
  const connector = connectors.find((i) => i.id === id);

  if (!connector) {
    return <p className="p-6 text-center text-gray-500">Connector not found</p>;
  }

  return <ClientWrapper connector={connector} />;
}
