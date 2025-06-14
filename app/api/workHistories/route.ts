import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET: lấy tất cả work histories (không bị xóa)
export async function GET() {
  const histories = await prisma.workHistory.findMany({
    where: { deleted: false },
    include: { expert: true },
  })

  return NextResponse.json(histories)
}

// POST: tạo mới work history
export async function POST(req: Request) {
  const body = await req.json()

  try {
    const created = await prisma.workHistory.create({
      data: {
        startYear: body.startYear,
        endYear: body.endYear,
        position: body.position,
        workplace: body.workplace,
        field: body.field,
        expertId: body.expertId,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
