import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getProjectsOfExpert } from "@/lib/handlers/projectHandlers";

export async function GET(_req: NextRequest, context: any) {
  const projects = await getProjectsOfExpert(context.params.id);
  return NextResponse.json(projects);
}
