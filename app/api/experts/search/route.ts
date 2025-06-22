import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/experts/search?name=...&degree=...&org=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";
  const degree = searchParams.get("degree") || "";
  const org = searchParams.get("org") || "";

  const experts = await prisma.expert.findMany({
    where: {
      deleted: false,
      fullName: { contains: name },
      degree: { contains: degree },
      organization: { contains: org },
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(experts);
}
