import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getProjectsOfExpert } from "@/lib/handlers/projectHandlers";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parseId = parseInt(id);
  const projects = await getProjectsOfExpert(parseId);
  return NextResponse.json(projects);
}
