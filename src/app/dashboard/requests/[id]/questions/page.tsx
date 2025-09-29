import QuestionsClient from "./Client";

interface QuestionsPageProps {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function RequestQuestionsPage({
  params,
  searchParams,
}: QuestionsPageProps) {
  const { id } = await params;

  const modeParam = (await searchParams)?.mode;
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
