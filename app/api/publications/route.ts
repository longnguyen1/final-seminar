// app/api/publications/route.ts
import { NextResponse } from "next/server";
import {
  getAllPublications,
  createPublication,
} from "@/lib/handlers/publicationHandlers";
import { withAdmin } from "@/lib/middlewares/withAdmin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const expertId = searchParams.get("id");

  if (!expertId) {
    return NextResponse.json(
      {
        error: "Thiếu id chuyên gia",
        publications: [],
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
          publications: [],
          count: 0,
          expertId: Number(expertId),
          success: false,
          message: `Không tìm thấy chuyên gia với id ${expertId}`,
        },
        { status: 404 }
      );
    }

    const publications = await prisma.publication.findMany({
      where: {
        expertId: Number(expertId),
        deleted: false,
      },
      select: {
        id: true,
        expertId: true,
        year: true,
        title: true,
        type: true,
        author: true,
        place: true,
      },
      orderBy: { year: "desc" }, // Năm gần nhất trước
    });

    const response = {
      publications,
      count: publications.length,
      expertId: Number(expertId),
      expertName: expert.fullName,
      success: true,
      message:
        publications.length > 0
          ? `Tìm thấy ${publications.length} công trình khoa học của ${expert.fullName}`
          : `${expert.fullName} chưa có công trình khoa học nào được ghi nhận`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Publication by expert error:", error);
    return NextResponse.json(
      {
        error: "Lỗi máy chủ",
        publications: [],
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
  const publication = await createPublication(data);
  return NextResponse.json(publication);
}

export const dynamic = "force-dynamic";
