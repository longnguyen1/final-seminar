import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPublicationsOfExpert } from "@/lib/handlers/publicationHandlers";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parseId = parseInt(id);
  const publications = await getPublicationsOfExpert(parseId);
  return NextResponse.json(publications);
}
