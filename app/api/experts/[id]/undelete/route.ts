import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { undeleteExpert } from "@/lib/handlers/expertHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

// ✅ KHÔNG khai báo type cho params!
export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await withAdmin();
  const { id } = await context.params;
  const parseId = parseInt(id);
  const expert = await undeleteExpert(parseId);
  return NextResponse.json(expert);
}
