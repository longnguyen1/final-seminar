// app/api/workHistories/undelete/route.ts
import { NextResponse } from "next/server";
import { undeleteWorkHistory } from "@/lib/handlers/workHistoryHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const workHistory = await undeleteWorkHistory(parseId);
  return NextResponse.json(workHistory);
}
