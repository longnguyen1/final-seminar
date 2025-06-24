import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getWorkHistoriesOfExpert } from "@/lib/handlers/workHistoryHandlers";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parseId = parseInt(id);
  const workHistories = await getWorkHistoriesOfExpert(parseId);
  return NextResponse.json(workHistories);
}
