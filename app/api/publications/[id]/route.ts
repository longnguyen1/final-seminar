import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getPublicationById,
  updatePublication,
  softDeletePublication,
} from "@/lib/handlers/publicationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_req: NextRequest, context: any){
  const publication = await getPublicationById(context.params.id);
  return NextResponse.json(publication);
}

export async function PUT(req: NextRequest, context: any) {
  await withAdmin();
  const data = await req.json();
  const publication = await updatePublication(context.params.id, data);
  return NextResponse.json(publication);
}

export async function DELETE(_req: NextRequest, context: any) {
  await withAdmin();
  const publication = await softDeletePublication(context.params.id);
  return NextResponse.json(publication);
}
