import AnswerDetailClient from "./AnswerDetailClient";

export default async function AnswerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AnswerDetailClient id={id} />;
}
