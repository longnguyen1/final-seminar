// app/api/projects/route.ts
import { NextResponse } from "next/server";
import {
  getAllProjects,
  createProject,
} from "@/lib/handlers/projectHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET() {
  const projects = await getAllProjects();
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  await withAdmin();
  const data = await req.json();
  const project = await createProject(data);
  return NextResponse.json(project);
}
