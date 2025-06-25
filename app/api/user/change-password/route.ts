import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const { oldPassword, newPassword } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !user.password || !(await bcrypt.compare(oldPassword, user.password))) {
    return new Response("Mật khẩu cũ không đúng", { status: 400 });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashed },
  });
  return new Response("OK");
}