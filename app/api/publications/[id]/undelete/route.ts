// app/api/publications/undelete/route.ts
import { NextResponse } from "next/server";
import { undeletePublication } from "@/lib/handlers/publicationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function POST(req: Request) {
  await withAdmin();
  const { id } = await req.json();
  const publication = await undeletePublication(id);
  return NextResponse.json(publication);
}
