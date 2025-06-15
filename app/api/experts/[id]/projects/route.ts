// app/api/experts/[id]/projects/route.ts
import { NextResponse } from "next/server";
import { getProjectsOfExpert } from "@/lib/handlers/projectHandlers";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const projects = await getProjectsOfExpert(params.id);
  return NextResponse.json(projects);
}
