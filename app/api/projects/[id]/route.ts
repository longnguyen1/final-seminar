// app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import {
  getProjectById,
  updateProject,
  softDeleteProject,
} from "@/lib/handlers/projectHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);
  return NextResponse.json(project);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const data = await req.json();
  const project = await updateProject(params.id, data);
  return NextResponse.json(project);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const project = await softDeleteProject(params.id);
  return NextResponse.json(project);
}
