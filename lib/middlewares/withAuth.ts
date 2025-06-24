// lib/middlewares/withAuth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function withAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
