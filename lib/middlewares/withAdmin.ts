import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function withAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized: Admin only");
  }
}
