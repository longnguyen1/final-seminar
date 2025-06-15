// app/api/projects/undelete/route.ts
import { NextResponse } from "next/server";
import { undeleteProject } from "@/lib/handlers/projectHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function POST(req: Request) {
  await withAdmin();
  const { id } = await req.json();
  const project = await undeleteProject(id);
  return NextResponse.json(project);
}
