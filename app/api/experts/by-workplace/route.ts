import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const workplace = searchParams.get('workplace');

    if (!workplace) {
        return NextResponse.json({ error: 'Thiếu tên nơi làm việc' }, { status: 400 });
    }

    try {
        // Lấy danh sách workhistory có nơi làm việc phù hợp
        const workhistories = await prisma.workHistory.findMany({
            where: {
                workplace: {
                    contains: workplace,
                },
                deleted: false,
            },
            select: {
                expertId: true,
                startYear: true,
                endYear: true,
                position: true,
            },
        });

        if (!workhistories.length) {
            return NextResponse.json([], { status: 200 });
        }

        // Lấy thông tin chuyên gia từ expertId
        const expertIds = workhistories.map(w => w.expertId);
        const experts = await prisma.expert.findMany({
            where: {
                id: { in: expertIds },
                deleted: false,
            },
            select: {
                id: true,
                fullName: true,
            }
        });

        // Ghép thông tin position, startyear, endyear vào từng chuyên gia
        const result = experts.map(expert => {
            const work = workhistories.find(w => w.expertId === expert.id);
            return {
                name: expert.fullName,
                position: work?.position || "Chưa rõ", 
            };
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Đã xảy ra lỗi máy chủ' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic'; 