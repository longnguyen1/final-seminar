// app/api/experts/[id]/publications/route.ts
import { NextResponse } from "next/server";
import { getPublicationsOfExpert } from "@/lib/handlers/publicationHandlers";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const publications = await getPublicationsOfExpert(params.id);
  return NextResponse.json(publications);
}
