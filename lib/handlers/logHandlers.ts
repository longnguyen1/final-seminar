import { prisma } from "@/lib/prisma";

export const writeLog = async (userId: string, action: string, entity: string, entityId: number, detail?: string) => {
  return prisma.auditLog.create({
    data: { userId, action, entity, entityId, detail },
  });
};
