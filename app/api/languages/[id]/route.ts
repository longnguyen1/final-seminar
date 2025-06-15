import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getLanguageById,
  updateLanguage,
  softDeleteLanguage,
} from "@/lib/handlers/languageHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_req: NextRequest, context: any) {
  const language = await getLanguageById(context.params.id);
  return NextResponse.json(language);
}

export async function PUT(req: NextRequest, context: any) {
  await withAdmin();
  const data = await req.json();
  const language = await updateLanguage(context.params.id, data);
  return NextResponse.json(language);
}

export async function DELETE(_req: NextRequest, context: any) {
  await withAdmin();
  const language = await softDeleteLanguage(context.params.id);
  return NextResponse.json(language);
}
