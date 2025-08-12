import { integrations } from "../DummyData";
import ClientWrapper from "./ClientWrapper";

interface IntegrationOverviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function IntegrationOverviewPage({
  params,
}: IntegrationOverviewPageProps) {
  const { id } = await params;

  const integration = integrations.find((i) => i.id === id);

  if (!integration) {
    return (
      <p className="p-6 text-center text-gray-500">Integration not found</p>
    );
  }

  return <ClientWrapper integration={integration} />;
}
