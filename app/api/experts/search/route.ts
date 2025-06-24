import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/middlewares/withAdmin";
import { getExperts } from "@/lib/handlers/expertHandlers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";
  const degree = searchParams.get("degree") || "";
  const org = searchParams.get("org") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const take = 10;
  const skip = (page - 1) * take;

  const experts = await prisma.expert.findMany({
    where: {
      deleted: false,
      fullName: { contains: name },
      degree: { contains: degree },
      organization: { contains: org },
    },
    skip,
    take,
    orderBy: { id: "asc" },
  });

  return NextResponse.json(experts);
}


