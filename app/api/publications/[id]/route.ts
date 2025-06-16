import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getPublicationById,
  updatePublication,
  softDeletePublication,
} from "@/lib/handlers/publicationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parseId = parseInt(id);
  const publication = await getPublicationById(parseId);
  return NextResponse.json(publication);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const data = await req.json();
  const publication = await updatePublication(parseId, data);
  return NextResponse.json(publication);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const publication = await softDeletePublication(parseId);
  return NextResponse.json(publication);
}
