import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getEducationsOfExpert } from "@/lib/handlers/educationHandlers";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parseId = parseInt(id);
  const educations = await getEducationsOfExpert(parseId);
  return NextResponse.json(educations);
}
