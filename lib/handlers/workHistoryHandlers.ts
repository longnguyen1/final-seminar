// lib/handlers/workHistoryHandlers.ts
import { prisma } from "../prisma";

/**
 * Lấy toàn bộ WorkHistories (soft-delete = false)
 */
export async function getAllWorkHistories() {
  return prisma.workHistory.findMany({
    where: { deleted: false },
  });
}

/**
 * Tạo WorkHistory mới
 */
export async function createWorkHistory(data: any) {
  return prisma.workHistory.create({
    data,
  });
}

/**
 * Lấy WorkHistory theo id
 */
export async function getWorkHistoryById(id: number) {
  return prisma.workHistory.findUnique({
    where: { id },
  });
}

/**
 * Cập nhật WorkHistory theo id
 */
export async function updateWorkHistory(id: number, data: any) {
  return prisma.workHistory.update({
    where: { id },
    data,
  });
}

/**
 * Soft-delete WorkHistory
 */
export async function softDeleteWorkHistory(id: number) {
  return prisma.workHistory.update({
    where: { id },
    data: { deleted: true },
  });
}

/**
 * Khôi phục WorkHistory đã xoá mềm
 */
export async function undeleteWorkHistory(id: number) {
  return prisma.workHistory.update({
    where: { id },
    data: { deleted: false },
  });
}

/**
 * Lấy danh sách WorkHistories của 1 Expert cụ thể
 */
export async function getWorkHistoriesOfExpert(expertId: number) {
  return prisma.workHistory.findMany({
    where: {
      expertId,
      deleted: false,
    },
  });
}
