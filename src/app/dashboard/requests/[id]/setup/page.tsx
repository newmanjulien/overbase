import SetupClient from "./Client";

interface SetupPageProps {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function RequestSetupPage({
  params,
  searchParams,
}: SetupPageProps) {
  const { id } = params;

  // Normalize `?date=YYYY-MM-DD`
  let prefillDate: string | undefined;
  const raw = searchParams?.date;
  if (typeof raw === "string") {
    prefillDate = raw;
  } else if (Array.isArray(raw) && raw.length > 0) {
    prefillDate = raw[0];
  }

  return <SetupClient requestId={id} prefillDate={prefillDate} />;
}
