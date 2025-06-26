// File: expert-dashboard/app/api/search-experts/route.ts
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "";
    const organization = searchParams.get("organization") || "";
    const field = searchParams.get("field") || "";
    const degree = searchParams.get("degree") || "";

    if (!name && !organization && !field && !degree) {
        return new Response(JSON.stringify({ error: "No search parameters provided" }), { status: 400 });
    }

    const experts = await prisma.expert.findMany({
        where: {
            workHistories: {
                some: {
                    field: { contains: field },
                },
            },
            OR: [
                { fullName: { contains: name } },
                { organization: { contains: organization } },
                { degree: { contains: degree } },
            ],
        },
        select: {
            id: true,
            fullName: true,
            organization: true,
            degree: true,
            workHistories: {
                select: {
                    field: true,    
                },
            },
        },
    });
    return new Response(JSON.stringify(experts), { status: 200, headers: { "Content-Type": "application/json" } });
}