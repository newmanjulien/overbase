// /src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // You can pick whichever dashboard subpage should be the default
  redirect("/dashboard/email");
}
