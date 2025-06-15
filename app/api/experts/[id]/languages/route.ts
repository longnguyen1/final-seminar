// app/api/experts/[id]/languages/route.ts
import { NextResponse } from "next/server";
import { getLanguagesOfExpert } from "@/lib/handlers/languageHandlers";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const languages = await getLanguagesOfExpert(params.id);
  return NextResponse.json(languages);
}
