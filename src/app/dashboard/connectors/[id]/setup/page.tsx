import Setup from "./Setup";
import { connectors } from "../../DummyData";

interface SetupPageProps {
  params: Promise<{ id: string }>;
}

export default async function SetupPage({ params }: SetupPageProps) {
  // ✅ Await params (Next.js 15+ dynamic routes)
  const { id } = await params;

  // Find the connector by ID
  const connector = connectors.find((i) => i.id === id);

  if (!connector) {
    return <p className="p-6 text-center text-gray-500">Connector not found</p>;
  }

  // Pass the connector into the client component
  return <Setup connector={connector} />;
}
