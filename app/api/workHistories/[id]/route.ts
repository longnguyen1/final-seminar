// app/api/workHistories/[id]/route.ts
import { NextResponse } from "next/server";
import {
  getWorkHistoryById,
  updateWorkHistory,
  softDeleteWorkHistory,
} from "@/lib/handlers/workHistoryHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const workHistory = await getWorkHistoryById(params.id);
  return NextResponse.json(workHistory);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const data = await req.json();
  const workHistory = await updateWorkHistory(params.id, data);
  return NextResponse.json(workHistory);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await withAdmin();
  const workHistory = await softDeleteWorkHistory(params.id);
  return NextResponse.json(workHistory);
}
