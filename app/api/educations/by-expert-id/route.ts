import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const expertId = searchParams.get('id'); // Đổi từ name sang id

    if (!expertId) {
        return NextResponse.json({ error: 'Thiếu id chuyên gia' }, { status: 400 });
    }

    try {
        // Lấy danh sách quá trình đào tạo
        const educations = await prisma.education.findMany({
            where: {
                expertId: Number(expertId),
                deleted: false,
            },
            select: {
                expertId: true,
                year: true,
                school: true,
                major: true,
            },
            orderBy: {
                year: 'asc',
            },
        });

        return NextResponse.json(educations, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Đã xảy ra lỗi máy chủ' }, { status: 500 });
    }
}
export const dynamic = 'force-dynamic'; // Đảm bảo API luôn được gọi mới