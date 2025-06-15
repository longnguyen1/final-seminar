// app/api/languages/[id]/route.ts
import { NextResponse } from "next/server";
import {
  getLanguageById,
  updateLanguage,
  softDeleteLanguage,
} from "@/lib/handlers/languageHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const language = await getLanguageById(params.id);
  return NextResponse.json(language);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const data = await req.json();
  const language = await updateLanguage(params.id, data);
  return NextResponse.json(language);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const language = await softDeleteLanguage(params.id);
  return NextResponse.json(language);
}
