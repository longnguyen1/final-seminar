import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });
  const { name } = await req.json();
  await prisma.user.update({
    where: { email: session.user.email },
    data: { name },
  });
  return new Response("OK");
}