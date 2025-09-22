import Questions from "./Questions";

interface QuestionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function RequestQuestionsPage({
  params,
}: QuestionsPageProps) {
  const { id } = await params;
  return <Questions requestId={id} />;
}
