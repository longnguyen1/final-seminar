// app/api/experts/[id]/workHistories/route.ts
import { NextResponse } from "next/server";
import { getWorkHistoriesOfExpert } from "@/lib/handlers/workHistoryHandlers";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const workHistories = await getWorkHistoriesOfExpert(params.id);
  return NextResponse.json(workHistories);
}
