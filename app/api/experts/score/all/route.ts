import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const experts = await prisma.expert.findMany({
      where: { deleted: false },
      select: {
        id: true,
        fullName: true,
        organization: true,
        degree: true,
        educations: true,
        workHistories: true,
        publications: true,
        projects: true,
        languages: true,
      },
    });

    // Tính điểm cho từng chuyên gia
    const expertScores = experts.map((expert) => {
      const score =
        expert.educations.length * 1 +
        expert.workHistories.length * 1 +
        expert.projects.length * 3 +
        expert.publications.length * 2 +
        expert.languages.length * 1.5;

      return {
        id: expert.id,
        fullName: expert.fullName,
        organization: expert.organization || '',
        degree: expert.degree || '',
        score,
        scores: {
          educations: expert.educations.length,
          workHistories: expert.workHistories.length,
          publications: expert.publications.length,
          projects: expert.projects.length,
          languages: expert.languages.length,
        },
      };
    });

    // Sắp xếp theo điểm giảm dần
    const rankedExperts = expertScores
      .sort((a, b) => b.score - a.score)
      .map((expert, index) => ({ ...expert, rank: index + 1 }));

    return NextResponse.json(rankedExperts);
  } catch (error) {
    console.error('Lỗi khi tính ExpertScore:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi xử lý dữ liệu.' },
      { status: 500 }
    );
  }
}
