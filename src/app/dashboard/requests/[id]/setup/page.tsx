import SetupClient from "./Client";

interface SetupPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RequestSetupPage({
  params,
  searchParams,
}: SetupPageProps) {
  const { id } = await params;
  const search = await searchParams;

  const prefillDate =
    typeof search?.date === "string"
      ? search.date
      : Array.isArray(search?.date)
      ? search.date[0]
      : undefined;

  return <SetupClient requestId={id} prefillDate={prefillDate} />;
}
