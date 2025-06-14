import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// Lấy tất cả dự án (chưa bị xóa mềm)
export async function GET() {
  const projects = await prisma.project.findMany({
    where: { deleted: false },
    include: { expert: true },
  })

  return NextResponse.json(projects)
}

// Tạo mới dự án
export async function POST(req: Request) {
  const body = await req.json()

  try {
    const newProject = await prisma.project.create({
      data: {
        startYear: body.startYear,
        endYear: body.endYear,
        title: body.title,
        status: body.status,
        role: body.role,
        expertId: body.expertId,
      },
    })

    return NextResponse.json(newProject)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
