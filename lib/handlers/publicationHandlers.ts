// lib/handlers/publicationHandlers.ts
import { prisma } from "../prisma";

/**
 * Lấy toàn bộ Publications (deleted = false)
 */
export async function getAllPublications() {
  return prisma.publication.findMany({
    where: { deleted: false },
  });
}

/**
 * Tạo Publication mới
 */
export async function createPublication(data: any) {
  return prisma.publication.create({
    data,
  });
}

/**
 * Lấy Publication theo id
 */
export async function getPublicationById(id: string) {
  return prisma.publication.findUnique({
    where: { id: Number(id) },
  });
}

/**
 * Cập nhật Publication theo id
 */
export async function updatePublication(id: string, data: any) {
  return prisma.publication.update({
    where: { id: Number(id) },
    data,
  });
}

/**
 * Soft-delete Publication
 */
export async function softDeletePublication(id: string) {
  return prisma.publication.update({
    where: { id: Number(id) },
    data: { deleted: true },
  });
}

/**
 * Khôi phục Publication đã soft-delete
 */
export async function undeletePublication(id: string) {
  return prisma.publication.update({
    where: { id: Number(id) },
    data: { deleted: false },
  });
}

/**
 * Lấy danh sách Publications của 1 Expert cụ thể
 */
export async function getPublicationsOfExpert(expertId: string) {
  return prisma.publication.findMany({
    where: {
      expertId: Number(expertId),
      deleted: false,
    },
  });
}
