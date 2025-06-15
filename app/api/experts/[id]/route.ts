import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAdmin } from "@/lib/middlewares/withAdmin";
import {
  getExpertById,
  updateExpert,
  softDeleteExpert,
} from "@/lib/handlers/expertHandlers";

// GET: /api/experts/:id
export async function GET(_req: NextRequest, context: any) {
  const expert = await getExpertById(context.params.id);
  return NextResponse.json(expert);
}

// PUT: /api/experts/:id
export async function PUT(req: NextRequest, context: any) {
  await withAdmin();
  const data = await req.json();
  const expert = await updateExpert(context.params.id, data);
  return NextResponse.json(expert);
}

// DELETE: /api/experts/:id
export async function DELETE(_req: NextRequest, context: any) {
  await withAdmin();
  const expert = await softDeleteExpert(context.params.id);
  return NextResponse.json(expert);
}
