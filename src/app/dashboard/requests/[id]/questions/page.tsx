import QuestionsClient from "./QuestionsClient";

interface QuestionsPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function QuestionsPage({
  params,
  searchParams,
}: QuestionsPageProps) {
  const { id } = await params;
  const search = await searchParams;

  if (!id) return <div className="p-6 text-center">⚠️ Invalid request ID</div>;

  // handle optional ?date and ?mode just like setup does
  const rawDate = search?.date;
  const prefillDate =
    typeof rawDate === "string"
      ? rawDate
      : Array.isArray(rawDate) && rawDate.length > 0
      ? rawDate[0]
      : undefined;

  const modeParam = search?.mode;
  const mode =
    (typeof modeParam === "string"
      ? modeParam
      : Array.isArray(modeParam)
      ? modeParam[0]
      : null) ?? "create";

  return (
    <QuestionsClient
      requestId={id}
      prefillDate={prefillDate}
      mode={mode as "create" | "edit" | "editDraft"}
    />
  );
}
