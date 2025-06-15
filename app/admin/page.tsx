// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions }     from "@/app/api/auth/[...nextauth]/route";
import ExpertTable         from "./experts/ExpertTable";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // hoặc redirect("/auth/signin")
    return <p>Bạn cần đăng nhập để truy cập trang này.</p>;
  }

  return <ExpertTable />;
}
