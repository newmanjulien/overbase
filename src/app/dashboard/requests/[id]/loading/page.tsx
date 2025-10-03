import LoadingClient from "./LoadingClient";

interface LoadingPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoadingPage({
  params,
  searchParams,
}: LoadingPageProps) {
  const { id } = await params;
  const search = await searchParams;

  if (!id) {
    return <div className="p-6 text-center">⚠️ Invalid request ID</div>;
  }

  // Parse optional date
  const rawDate = search?.date;
  const date =
    typeof rawDate === "string"
      ? rawDate
      : Array.isArray(rawDate) && rawDate.length > 0
      ? rawDate[0]
      : undefined;

  // Parse mode
  const modeParam = search?.mode;
  const mode =
    (typeof modeParam === "string"
      ? modeParam
      : Array.isArray(modeParam)
      ? modeParam[0]
      : null) ?? "create";

  return (
    <LoadingClient
      requestId={id}
      mode={mode as "create" | "edit" | "editDraft"}
      date={date}
    />
  );
}
