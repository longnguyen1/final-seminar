// app/api/experts/route.ts
import { NextResponse } from "next/server";
import { getAllExperts, createExpert } from "@/lib/handlers/expertHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET() {
  const experts = await getAllExperts();
  return NextResponse.json(experts);
}

export async function POST(req: Request) {
  await withAdmin();
  const data = await req.json();
  const expert = await createExpert(data);
  return NextResponse.json(expert);
}
