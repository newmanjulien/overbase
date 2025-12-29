import AnswerClient from "./AnswerClient";

export default async function AnswerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AnswerClient id={id} />;
}
