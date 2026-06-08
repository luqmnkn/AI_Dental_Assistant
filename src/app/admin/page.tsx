import AdminDashboardClient from "./AdminDashboardClient";
import { getUserFromServer } from "@/lib/auth";
import { redirect } from "next/navigation";

async function AdminPage() {
  const user = await getUserFromServer();
  // allow only this specific email to access admin
  if (!user || user.email !== "luqmnkn@gmail.com") redirect("/");

  return <AdminDashboardClient />;
}

export default AdminPage;
