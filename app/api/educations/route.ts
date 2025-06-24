// app/api/educations/route.ts
import { NextResponse } from "next/server";
import {
  getAllEducations,
  createEducation,
} from "@/lib/handlers/educationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET() {
  const educations = await getAllEducations();
  return NextResponse.json(educations);
}

export async function POST(req: Request) {
  await withAdmin();
  const data = await req.json();
  const education = await createEducation(data);
  return NextResponse.json(education);
}
