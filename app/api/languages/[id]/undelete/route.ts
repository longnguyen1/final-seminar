// app/api/languages/undelete/route.ts
import { NextResponse } from "next/server";
import { undeleteLanguage } from "@/lib/handlers/languageHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function POST(req: Request) {
  await withAdmin();
  const { id } = await req.json();
  const language = await undeleteLanguage(id);
  return NextResponse.json(language);
}
