import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getProjectById,
  updateProject,
  softDeleteProject,
} from "@/lib/handlers/projectHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_req: NextRequest, context: any) {
  const project = await getProjectById(context.params.id);
  return NextResponse.json(project);
}

export async function PUT(req: NextRequest, context: any) {
  await withAdmin();
  const data = await req.json();
  const project = await updateProject(context.params.id, data);
  return NextResponse.json(project);
}

export async function DELETE(_req: NextRequest, context: any) {
  await withAdmin();
  const project = await softDeleteProject(context.params.id);
  return NextResponse.json(project);
}
