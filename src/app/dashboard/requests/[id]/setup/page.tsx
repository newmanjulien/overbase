import SetupClient from "./SetupClient";

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

  // NEW: handle mode
  const modeParam = (await searchParams)?.mode;
  const mode =
    (typeof modeParam === "string"
      ? modeParam
      : Array.isArray(modeParam)
      ? modeParam[0]
      : null) ?? "create";

  return (
    <SetupClient
      requestId={id}
      prefillDate={prefillDate}
      mode={mode as "create" | "edit" | "editDraft"} // ✅ pass it down
    />
  );
}
