import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getLanguagesOfExpert } from "@/lib/handlers/languageHandlers";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parseId = parseInt(id);
  const languages = await getLanguagesOfExpert(parseId);
  return NextResponse.json(languages);
}
