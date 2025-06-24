// app/api/educations/undelete/route.ts
import { NextResponse } from "next/server";
import { undeleteEducation } from "@/lib/handlers/educationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const education = await undeleteEducation(parseId);
  return NextResponse.json(education);
}
