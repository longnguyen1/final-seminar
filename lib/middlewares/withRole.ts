import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const withRole = async (allowedRoles: string[]) => {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user.role ||
    !allowedRoles.includes(session.user.role)
  ) {
    throw new Error("Unauthorized");
  }
};
