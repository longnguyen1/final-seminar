import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getWorkHistoriesOfExpert } from "@/lib/handlers/workHistoryHandlers";

export async function GET(_req: NextRequest, context: any) {
  const workHistories = await getWorkHistoriesOfExpert(context.params.id);
  return NextResponse.json(workHistories);
}
