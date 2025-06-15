// app/api/publications/[id]/route.ts
import { NextResponse } from "next/server";
import {
  getPublicationById,
  updatePublication,
  softDeletePublication,
} from "@/lib/handlers/publicationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const publication = await getPublicationById(params.id);
  return NextResponse.json(publication);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const data = await req.json();
  const publication = await updatePublication(params.id, data);
  return NextResponse.json(publication);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const publication = await softDeletePublication(params.id);
  return NextResponse.json(publication);
}
