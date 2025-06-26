import { prisma } from "@/lib/prisma"; // đường dẫn đúng nếu bạn dùng alias
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userMessage, botReply, source, userId } = await req.json();

    const saved = await prisma.messageLog.create({
      data: {
        userMessage,
        botReply,
        source,
        userId
      }
    });

    return NextResponse.json({ status: "ok", saved });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log message" }, { status: 500 });
  }
}
