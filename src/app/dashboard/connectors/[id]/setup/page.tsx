import { connectors } from "../../DummyData";
import Setup from "./Setup";

interface SetupPageProps {
  params: Promise<{ id: string }>;
}

export default async function SetupPage({ params }: SetupPageProps) {
  const { id } = await params;

  const connector = connectors.find((i) => i.id === id);

  if (!connector) {
    return <p className="p-6 text-center text-gray-500">Connector not found</p>;
  }

  return <Setup connector={connector} />;
}
