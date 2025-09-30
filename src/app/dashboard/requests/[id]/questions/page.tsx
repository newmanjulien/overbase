import QuestionsClient from "./QuestionsClient";

interface QuestionsPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RequestQuestionsPage({
  params,
  searchParams,
}: QuestionsPageProps) {
  const { id } = await params;
  const search = await searchParams;

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
      mode={mode as "create" | "edit" | "editDraft"}
    />
  );
}
