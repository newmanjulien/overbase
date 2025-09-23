import { connectors } from "../DummyData";
import OverviewClient from "./Client";

interface ConnectorOverviewPageProps {
  params: { id: string };
}

export default function ConnectorOverviewPage({
  params,
}: ConnectorOverviewPageProps) {
  const { id } = params; // ✅ synchronous object
  const connector = connectors.find((i) => i.id === id);

  if (!connector) {
    return <p className="p-6 text-center text-gray-500">Connector not found</p>;
  }

  return <OverviewClient connector={connector} />;
}
