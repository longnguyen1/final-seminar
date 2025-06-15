// lib/middlewares/withAdmin.ts
import { withAuth } from "./withAuth";

export async function withAdmin() {
  const session = await withAuth();
  if (session.user.role !== "admin") {
    throw new Error("Forbidden: Admins only");
  }
  return session;
}
