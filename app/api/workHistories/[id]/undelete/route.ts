// app/api/workHistories/undelete/route.ts
import { NextResponse } from "next/server";
import { undeleteWorkHistory } from "@/lib/handlers/workHistoryHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function POST(req: Request) {
  await withAdmin();
  const { id } = await req.json();
  const workHistory = await undeleteWorkHistory(id);
  return NextResponse.json(workHistory);
}
