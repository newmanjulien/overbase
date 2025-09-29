import SetupClient from "./SetupClient";
import { connectors } from "../../DummyData";

interface SetupPageProps {
  params: Promise<{ id: string }>;
}

export default async function SetupPage({ params }: SetupPageProps) {
  const { id } = await params; // ✅ synchronous object

  // Find the connector by ID
  const connector = connectors.find((i) => i.id === id);

  if (!connector) {
    return <p className="p-6 text-center text-gray-500">Connector not found</p>;
  }

  // Pass connector into client component
  return <SetupClient connector={connector} />;
}
