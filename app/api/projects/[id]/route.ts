import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getProjectById,
  updateProject,
  softDeleteProject,
} from "@/lib/handlers/projectHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parseId = parseInt(id);
  const project = await getProjectById(parseId);
  return NextResponse.json(project);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const data = await req.json();
  const project = await updateProject(parseId, data);
  return NextResponse.json(project);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> })  {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const project = await softDeleteProject(parseId);
  return NextResponse.json(project);
}
