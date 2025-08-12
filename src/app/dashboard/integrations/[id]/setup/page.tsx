import { integrations } from "../../DummyData";
import Setup from "./Setup";

interface SetupPageProps {
  params: Promise<{ id: string }>;
}

export default async function SetupPage({ params }: SetupPageProps) {
  const { id } = await params;

  const integration = integrations.find((i) => i.id === id);

  if (!integration) {
    return (
      <p className="p-6 text-center text-gray-500">Integration not found</p>
    );
  }

  return <Setup integration={integration} />;
}
