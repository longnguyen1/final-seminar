// app/api/projects/undelete/route.ts
import { NextResponse } from "next/server";
import { undeleteProject } from "@/lib/handlers/projectHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const project = await undeleteProject(parseId);
  return NextResponse.json(project);
}
