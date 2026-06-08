import AppointmentsPageClient from "./AppointmentsPageClient";
import { getUserFromServer } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppointmentsPage() {
  const user = await getUserFromServer();
  if (!user) redirect("/");

  return <AppointmentsPageClient />;
}
