// app/api/languages/undelete/route.ts
import { NextResponse } from "next/server";
import { undeleteLanguage } from "@/lib/handlers/languageHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const language = await undeleteLanguage(parseId);
  return NextResponse.json(language);
}
