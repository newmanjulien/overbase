import RequestsClient from "./RequestsClient";

export default function RequestsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Await the promise inside the component
  async function resolve() {
    const searchParams = (await props.searchParams) ?? {};
    const date =
      typeof searchParams.date === "string" ? searchParams.date : undefined;

    return <RequestsClient dateParam={date} />;
  }

  return resolve();
}
