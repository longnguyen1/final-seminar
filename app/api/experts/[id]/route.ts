import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAdmin } from "@/lib/middlewares/withAdmin";
import {
  getExpertById,
  updateExpert,
  softDeleteExpert,
} from "@/lib/handlers/expertHandlers";

// GET: /api/experts/:id
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parseId = parseInt(id);
  const expert = await getExpertById(parseId);
  return NextResponse.json(expert);
}

// PUT: /api/experts/:id
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const data = await req.json();
  const expert = await updateExpert(parseId, data);
  return NextResponse.json(expert);
}

// DELETE: /api/experts/:id
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const expert = await softDeleteExpert(parseId);
  return NextResponse.json(expert);
}
