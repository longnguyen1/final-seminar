import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { undeleteExpert } from "@/lib/handlers/expertHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";

// ✅ KHÔNG khai báo type cho params!
export async function POST(_req: NextRequest, context: any) {
  await withAdmin();
  const expert = await undeleteExpert(context.params.id);
  return NextResponse.json(expert);
}
