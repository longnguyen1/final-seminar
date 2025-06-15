// app/api/educations/undelete/route.ts
import { NextResponse } from "next/server";
import { undeleteEducation } from "@/lib/handlers/educationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function POST(req: Request) {
  await withAdmin();
  const { id } = await req.json();
  const education = await undeleteEducation(id);
  return NextResponse.json(education);
}
