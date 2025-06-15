import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getEducationsOfExpert } from "@/lib/handlers/educationHandlers";

export async function GET(_req: NextRequest, context: any) {
  const educations = await getEducationsOfExpert(context.params.id);
  return NextResponse.json(educations);
}
