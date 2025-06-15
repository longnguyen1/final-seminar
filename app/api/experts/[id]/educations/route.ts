// app/api/experts/[id]/educations/route.ts
import { NextResponse } from "next/server";
import { getEducationsOfExpert } from "@/lib/handlers/educationHandlers";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const educations = await getEducationsOfExpert(params.id);
  return NextResponse.json(educations);
}
