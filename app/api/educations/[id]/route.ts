import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getEducationById,
  updateEducation,
  softDeleteEducation,
} from "@/lib/handlers/educationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

// ✅ Dùng NextRequest làm type
export async function GET(_req: NextRequest, context: any) {
  const education = await getEducationById(context.params.id);
  return NextResponse.json(education);
}

export async function PUT(req: NextRequest, context: any) {
  await withAdmin();
  const data = await req.json();
  const education = await updateEducation(context.params.id, data);
  return NextResponse.json(education);
}

export async function DELETE(_req: NextRequest, context: any) {
  await withAdmin();
  const education = await softDeleteEducation(context.params.id);
  return NextResponse.json(education);
}
