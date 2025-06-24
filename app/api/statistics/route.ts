import { getStatistics } from "@/lib/handlers/statisticsHandlers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = await getStatistics();
    return NextResponse.json(stats); // ✅ Phải JSON
  } catch (err) {
    console.error("Statistics API Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
