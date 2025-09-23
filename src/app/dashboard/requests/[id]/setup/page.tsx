import SetupClient from "./Client";

interface SetupPageProps {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function RequestSetupPage({
  params,
  searchParams,
}: SetupPageProps) {
  const { id } = params; // ✅ synchronous object

  const prefillDate =
    typeof searchParams?.date === "string"
      ? searchParams.date
      : Array.isArray(searchParams?.date)
      ? searchParams.date[0]
      : undefined;

  return <SetupClient requestId={id} prefillDate={prefillDate} />;
}
