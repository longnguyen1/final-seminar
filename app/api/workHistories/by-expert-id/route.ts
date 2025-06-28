import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id'); // Lấy id chuyên gia từ query params

    if (!id) {
        return new Response(JSON.stringify({ error: 'Thiếu id chuyên gia' }), { status: 400 });
    }

    try {   
        // Lấy danh sách lịch sử làm việc của chuyên gia theo id
        const workHistories = await prisma.workHistory.findMany({
            where: {
                expertId: Number(id),
                deleted: false,
            },
            select: {
                expertId: true,
                startYear: true,
                endYear: true,
                workplace: true,    
                position: true,
            },
            orderBy: {
                startYear: 'asc',
            },
        });
        return new Response(JSON.stringify(workHistories), { status: 200 });
    } catch (error) {       
        return new Response(JSON.stringify({ error: 'Đã xảy ra lỗi máy chủ' }), { status: 500 });
    }
}

export const dynamic = 'force-dynamic';