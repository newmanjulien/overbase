import SetupClient from "./Client";

interface SetupPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RequestSetupPage({
  params,
  searchParams,
}: SetupPageProps) {
  const { id } = await params;

  const sp = searchParams ? await searchParams : undefined;

  const prefillDate =
    typeof sp?.date === "string"
      ? sp.date
      : Array.isArray(sp?.date)
      ? sp.date[0]
      : undefined;

  return <SetupClient requestId={id} prefillDate={prefillDate} />;
}
