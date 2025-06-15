// app/api/workHistories/route.ts
import { NextResponse } from "next/server";
import {
  getAllWorkHistories,
  createWorkHistory,
} from "@/lib/handlers/workHistoryHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET() {
  const workHistories = await getAllWorkHistories();
  return NextResponse.json(workHistories);
}

export async function POST(req: Request) {
  await withAdmin();
  const data = await req.json();
  const workHistory = await createWorkHistory(data);
  return NextResponse.json(workHistory);
}
