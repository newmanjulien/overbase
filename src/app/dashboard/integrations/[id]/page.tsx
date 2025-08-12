import Overview from "./Overview";
import { integrations } from "../DummyData";
import ClientWrapper from "./ClientWrapper";

interface IntegrationOverviewPageProps {
  params: { id: string };
}

export default function IntegrationOverviewPage({
  params,
}: IntegrationOverviewPageProps) {
  const integration = integrations.find((i) => i.id === params.id);

  if (!integration) {
    return (
      <p className="p-6 text-center text-gray-500">Integration not found</p>
    );
  }

  return <ClientWrapper integration={integration} />;
}
