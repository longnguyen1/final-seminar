import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getWorkHistoryById,
  updateWorkHistory,
  softDeleteWorkHistory,
} from "@/lib/handlers/workHistoryHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parseId = parseInt(id);
  const workHistory = await getWorkHistoryById(parseId);
  return NextResponse.json(workHistory);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const data = await req.json();
  const workHistory = await updateWorkHistory(parseId, data);
  return NextResponse.json(workHistory);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> })  {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const workHistory = await softDeleteWorkHistory(parseId);
  return NextResponse.json(workHistory);
}
