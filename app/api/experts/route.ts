// app/api/experts/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getExperts, createExpert } from "@/lib/handlers/expertHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam) : 1;
  const take = 10;
  const skip = (page - 1) * take;

  const experts = await getExperts(skip, take);
  return NextResponse.json(experts);
}

export async function POST(req: Request) {
  await withAdmin();
  const data = await req.json();
  const expert = await createExpert(data);
  return NextResponse.json(expert);
}
