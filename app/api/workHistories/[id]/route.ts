import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getWorkHistoryById,
  updateWorkHistory,
  softDeleteWorkHistory,
} from "@/lib/handlers/workHistoryHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_req: NextRequest, context: any) {
  const workHistory = await getWorkHistoryById(context.params.id);
  return NextResponse.json(workHistory);
}

export async function PUT(req: NextRequest, context: any) {
  await withAdmin();
  const data = await req.json();
  const workHistory = await updateWorkHistory(context.params.id, data);
  return NextResponse.json(workHistory);
}

export async function DELETE(_req: NextRequest, context: any) {
  await withAdmin();
  const workHistory = await softDeleteWorkHistory(context.params.id);
  return NextResponse.json(workHistory);
}
