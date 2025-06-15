import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPublicationsOfExpert } from "@/lib/handlers/publicationHandlers";

export async function GET(_req: NextRequest, context: any) {
  const publications = await getPublicationsOfExpert(context.params.id);
  return NextResponse.json(publications);
}
