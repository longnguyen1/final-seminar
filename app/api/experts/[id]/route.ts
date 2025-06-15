// app/api/experts/[id]/route.ts
import { NextResponse } from "next/server";
import {
  getExpertById,
  updateExpert,
  softDeleteExpert,
} from "@/lib/handlers/expertHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const expert = await getExpertById(params.id);
  return NextResponse.json(expert);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const data = await req.json();
  const expert = await updateExpert(params.id, data);
  return NextResponse.json(expert);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const expert = await softDeleteExpert(params.id);
  return NextResponse.json(expert);
}
