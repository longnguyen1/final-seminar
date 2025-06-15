// lib/handlers/educationHandlers.ts
import { prisma } from "../prisma";

export async function getAllEducations() {
  return prisma.education.findMany({
    where: { deleted: false },
  });
}

export async function createEducation(data: any) {
  return prisma.education.create({
    data,
  });
}

export async function getEducationById(id: string) {
  return prisma.education.findUnique({
    where: { id },
  });
}

export async function updateEducation(id: string, data: any) {
  return prisma.education.update({
    where: { id },
    data,
  });
}

export async function softDeleteEducation(id: string) {
  return prisma.education.update({
    where: { id },
    data: { deleted: true },
  });
}

export async function undeleteEducation(id: string) {
  return prisma.education.update({
    where: { id },
    data: { deleted: false },
  });
}

export async function getEducationsOfExpert(expertId: string) {
  return prisma.education.findMany({
    where: {
      expertId,
      deleted: false,
    },
  });
}
