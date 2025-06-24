import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const degrees = await prisma.expert.findMany({
    where: { deleted: false },
    select: { degree: true },
    distinct: ["degree"],
  });

  const organizations = await prisma.expert.findMany({
    where: { deleted: false },
    select: { organization: true },
    distinct: ["organization"],
  });

  return NextResponse.json({
    degrees: degrees.map(d => d.degree).filter(Boolean),
    organizations: organizations.map(o => o.organization).filter(Boolean),
  });
}
