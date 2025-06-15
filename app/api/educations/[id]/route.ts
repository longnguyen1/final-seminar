// app/api/educations/[id]/route.ts
import { NextResponse } from "next/server";
import {
  getEducationById,
  updateEducation,
  softDeleteEducation,
} from "@/lib/handlers/educationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const education = await getEducationById(params.id);
  return NextResponse.json(education);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const data = await req.json();
  const education = await updateEducation(params.id, data);
  return NextResponse.json(education);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const education = await softDeleteEducation(params.id);
  return NextResponse.json(education);
}
