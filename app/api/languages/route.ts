import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET: lấy tất cả ngôn ngữ (chưa bị xóa mềm)
export async function GET() {
  const languages = await prisma.language.findMany({
    where: { deleted: false },
    include: { expert: true },
  })

  return NextResponse.json(languages)
}

// POST: tạo mới ngôn ngữ
export async function POST(req: Request) {
  const body = await req.json()

  try {
    const newLanguage = await prisma.language.create({
      data: {
        language: body.language,
        listening: body.listening,
        speaking: body.speaking,
        reading: body.reading,
        writing: body.writing,
        expertId: body.expertId,
      },
    })

    return NextResponse.json(newLanguage)
  } catch (error) {
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
