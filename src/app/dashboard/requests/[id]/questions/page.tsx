import QuestionsClient from "./Client";

interface QuestionsPageProps {
  params: { id: string };
}

export default function RequestQuestionsPage({ params }: QuestionsPageProps) {
  const { id } = params; // ✅ synchronous object
  return <QuestionsClient requestId={id} />;
}
