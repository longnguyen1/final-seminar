import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

type SessionUserWithRole = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUserWithRole | undefined;

  if (!session || !user || user.role !== "admin") {
    redirect("/auth/signin");
  }

  return <AdminDashboard />;
}
