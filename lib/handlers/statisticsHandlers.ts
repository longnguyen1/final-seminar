import { prisma } from "../prisma";

export const getStatistics = async () => {
  const total = await prisma.expert.count({ where: { deleted: false } });

  const byDegree = await prisma.expert.groupBy({
    by: ["degree"],
    where: { deleted: false },
    _count: { degree: true },
  });

  const byOrganization = await prisma.expert.groupBy({
    by: ["organization"],
    where: { deleted: false },
    _count: { organization: true },
  });

  return { total, byDegree, byOrganization };
};

