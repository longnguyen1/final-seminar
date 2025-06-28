import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const school = searchParams.get('school');

    if (!school) {
        return NextResponse.json({ error: 'Thiếu tên trường' }, { status: 400 });
    }

    try {
        // Lấy danh sách education có trường phù hợp
        const educations = await prisma.education.findMany({
            where: {
                school: {
                    contains: school,
                },
                deleted: false,
            },
            select: {
                expertId: true,
                major: true,
            }
        });

        if (!educations.length) {
            return NextResponse.json([], { status: 200 });
        }

        // Lấy thông tin chuyên gia từ expertId
        const expertIds = educations.map(e => e.expertId);
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

        // Ghép thông tin major vào từng chuyên gia
        const result = experts.map(expert => {
            const edu = educations.find(e => e.expertId === expert.id);
            return {
                name: expert.fullName,
                major: edu?.major || "Chưa có"
            };
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Đã xảy ra lỗi máy chủ' }, { status: 500 });
    }
}