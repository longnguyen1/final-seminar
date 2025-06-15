// app/api/languages/route.ts
import { NextResponse } from "next/server";
import {
  getAllLanguages,
  createLanguage,
} from "@/lib/handlers/languageHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET() {
  const languages = await getAllLanguages();
  return NextResponse.json(languages);
}

export async function POST(req: Request) {
  await withAdmin();
  const data = await req.json();
  const language = await createLanguage(data);
  return NextResponse.json(language);
}
