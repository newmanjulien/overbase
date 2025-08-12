import Setup from "./Setup";
import { integrations } from "../../DummyData";

interface SetupPageProps {
  params: { id: string };
}

export default function SetupPage({ params }: SetupPageProps) {
  const integration = integrations.find((i) => i.id === params.id);

  if (!integration) {
    return (
      <p className="p-6 text-center text-gray-500">Integration not found</p>
    );
  }

  return <Setup integration={integration} />;
}
