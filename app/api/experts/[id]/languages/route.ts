import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getLanguagesOfExpert } from "@/lib/handlers/languageHandlers";

export async function GET(_req: NextRequest, context: any) {
  const languages = await getLanguagesOfExpert(context.params.id);
  return NextResponse.json(languages);
}
