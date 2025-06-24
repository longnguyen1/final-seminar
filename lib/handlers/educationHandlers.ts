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

export async function getEducationById(id: number) {
  return prisma.education.findUnique({
    where: { id },
  });
}

export async function updateEducation(id: number, data: any) {
  return prisma.education.update({
    where: { id },
    data,
  });
}

export async function softDeleteEducation(id: number) {
  return prisma.education.update({
    where: { id },
    data: { deleted: true },
  });
}

export async function undeleteEducation(id: number) {
  return prisma.education.update({
    where: { id },
    data: { deleted: false },
  });
}

export async function getEducationsOfExpert(expertId: number) {
  return prisma.education.findMany({
    where: {
      expertId,
      deleted: false,
    },
  });
}
