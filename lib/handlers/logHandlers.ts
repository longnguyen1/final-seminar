<<<<<<< HEAD
import { prisma } from "@/lib/prisma";
=======
import prisma from "@/lib/prisma";
>>>>>>> 85d3238e0ac3f12f942d25ace87a976b60e56442

export const writeLog = async (userId: string, action: string, entity: string, entityId: number, detail?: string) => {
  return prisma.auditLog.create({
    data: { userId, action, entity, entityId, detail },
  });
};
