import ConfirmClient from "./ConfirmClient";

interface ConfirmPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ConfirmPage({
  params,
  searchParams,
}: ConfirmPageProps) {
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
    <ConfirmClient
      requestId={id}
      mode={mode as "create" | "edit" | "editDraft"}
    />
  );
}
