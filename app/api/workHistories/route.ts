// app/api/workHistories/route.ts
import { NextResponse } from "next/server";
import {
  getAllWorkHistories,
  createWorkHistory,
} from "@/lib/handlers/workHistoryHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const expertId = searchParams.get("id");

  if (!expertId) {
    return NextResponse.json(
      {
        error: "Thiếu id chuyên gia",
        workhistories: [],
        count: 0,
        success: false,
      },
      { status: 400 }
    );
  }

  try {
    // Kiểm tra expert có tồn tại không
    const expert = await prisma.expert.findUnique({
      where: {
        id: Number(expertId),
        deleted: false,
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    if (!expert) {
      return NextResponse.json(
        {
          error: "Không tìm thấy chuyên gia",
          workhistories: [],
          count: 0,
          expertId: Number(expertId),
          success: false,
          message: `Không tìm thấy chuyên gia với id ${expertId}`,
        },
        { status: 404 }
      );
    }

    const workhistories = await prisma.workHistory.findMany({
      where: {
        expertId: Number(expertId),
        deleted: false,
      },
      select: {
        id: true,
        expertId: true,
        startYear: true,
        endYear: true,
        position: true,
        workplace: true,
        field: true,
      },
      orderBy: [
        { endYear: "desc" }, // Công việc gần nhất trước
        { startYear: "desc" },
      ],
    });

    const response = {
      workhistories,
      count: workhistories.length,
      expertId: Number(expertId),
      expertName: expert.fullName,
      success: true,
      message:
        workhistories.length > 0
          ? `Tìm thấy ${workhistories.length} bản ghi quá trình công tác của ${expert.fullName}`
          : `${expert.fullName} chưa có thông tin quá trình công tác`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("WorkHistory by expert error:", error);
    return NextResponse.json(
      {
        error: "Lỗi máy chủ",
        workhistories: [],
        count: 0,
        expertId: Number(expertId),
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await withAdmin();
  const data = await req.json();
  const workHistory = await createWorkHistory(data);
  return NextResponse.json(workHistory);
}

export const dynamic = "force-dynamic";
