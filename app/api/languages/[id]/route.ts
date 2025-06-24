import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getLanguageById,
  updateLanguage,
  softDeleteLanguage,
} from "@/lib/handlers/languageHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parseId = parseInt(id);
  const language = await getLanguageById(parseId);
  return NextResponse.json(language);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const data = await req.json();
  const language = await updateLanguage(parseId, data);
  return NextResponse.json(language);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const language = await softDeleteLanguage(parseId);
  return NextResponse.json(language);
}
