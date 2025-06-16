import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getEducationById,
  updateEducation,
  softDeleteEducation,
} from "@/lib/handlers/educationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

// ✅ Dùng NextRequest làm type
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parseId = parseInt(id);
  const education = await getEducationById(parseId);
  return NextResponse.json(education);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const data = await req.json();
  const education = await updateEducation(parseId, data);
  return NextResponse.json(education);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> })  {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const education = await softDeleteEducation(parseId);
  return NextResponse.json(education);
}
