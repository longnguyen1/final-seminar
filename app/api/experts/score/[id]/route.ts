// app/api/experts/score/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
try {
  const expertId = Number(params.id);

  if (isNaN(expertId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const expert = await prisma.expert.findUnique({
    where: { id: expertId },
    include: {
      educations: true,
      workHistories: true,
      publications: true,
      projects: true,
      languages: true,
    },
  });

  if (!expert) {
    return NextResponse.json({ error: 'Không tìm thấy chuyên gia' }, { status: 404 });
  }

  // 🎓 Học vấn
  const degree = expert.degree?.toLowerCase();
  let educationScore = 0;
  if (degree?.includes('tiến sĩ')) educationScore += 3;
  else if (degree?.includes('thạc sĩ')) educationScore += 2;
  else if (degree?.includes('cử nhân, kĩ sư')) educationScore += 1;

  const schoolCount = expert.educations.length;
  educationScore += schoolCount * 0.5;

  // 🏢 Kinh nghiệm làm việc
  const workScore = expert.workHistories.length * 1;

  // Tính số năm làm việc (nếu có)
  const totalYears = expert.workHistories.reduce((sum, work) => {
    const start = new Date(work.startYear, 0, 1);
    const end = work.endYear ? new Date(work.endYear, 11, 31) : new Date();
    const diffYears = end.getFullYear() - start.getFullYear();
    return sum + diffYears;
  }, 0);
  const workYearScore = Math.min(5, Math.floor(totalYears / 3));

  // 📚 Công trình khoa học
  const publicationCount = expert.publications.length;
  let publicationScore = publicationCount * 0.5;
  if (publicationCount > 20) publicationScore += 3;

  // 🛠️ Dự án
  const projectScore = expert.projects.length * 0.5;

  // 🗣️ Ngôn ngữ
  let languageScore = expert.languages.length * 0.5;
  const rareLangs = ['pháp', 'đức', 'hàn', 'nhật', 'trung'];
  for (const lang of expert.languages) {
    if (rareLangs.some(r => lang.language.toLowerCase().includes(r))) {
      languageScore += 0.5; // cộng thêm
    }
  }

  const totalScore = educationScore + workScore + workYearScore + publicationScore + projectScore + languageScore;

  return NextResponse.json({
    expertId: expert.id,
    expertName: expert.fullName,
    scores: {
      educationScore,
      workScore,
      workYearScore,
      publicationScore,
      projectScore,
      languageScore,
    },
    totalScore,
  });
} catch (error) {
  console.error('Lỗi khi lấy thông tin chuyên gia:', error);
  return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
}
}   
