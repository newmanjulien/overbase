import QuestionsClient from "./Client";

interface QuestionsPageProps {
  params: { id: string };
}

export default async function RequestQuestionsPage({
  params,
}: QuestionsPageProps) {
  const { id } = await params;
  return <QuestionsClient requestId={id} />;
}
