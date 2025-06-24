// app/api/publications/route.ts
import { NextResponse } from "next/server";
import {
  getAllPublications,
  createPublication,
} from "@/lib/handlers/publicationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET() {
  const publications = await getAllPublications();
  return NextResponse.json(publications);
}

export async function POST(req: Request) {
  await withAdmin();
  const data = await req.json();
  const publication = await createPublication(data);
  return NextResponse.json(publication);
}
