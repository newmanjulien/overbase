import SetupClient from "./Client";

interface SetupPageProps {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function RequestSetupPage({
  params,
  searchParams,
}: SetupPageProps) {
  const { id } = await params;
  const raw = (await searchParams)?.date;

  let prefillDate: string | undefined;
  if (typeof raw === "string") {
    prefillDate = raw;
  } else if (Array.isArray(raw) && raw.length > 0) {
    prefillDate = raw[0];
  }

  return <SetupClient requestId={id} prefillDate={prefillDate} />;
}
