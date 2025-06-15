// lib/handlers/expertHandlers.ts
import { prisma } from "../prisma";

export async function getAllExperts() {
  return prisma.expert.findMany({
    where: { deleted: false },
    include: {
      educations: true,
      workHistories: true,
      publications: true,
      projects: true,
      languages: true,
    },
  });
}

export async function createExpert(data: any) {
  return prisma.expert.create({
    data,
  });
}

export async function getExpertById(id: string) {
  return prisma.expert.findUnique({
    where: { id: Number(id) },
    include: {
      educations: true,
      workHistories: true,
      publications: true,
      projects: true,
      languages: true,
    },
  });
}

export async function updateExpert(id: string, data: any) {
  return prisma.expert.update({
    where: { id: Number(id) },
    data,
  });
}

export async function softDeleteExpert(id: string) {
  return prisma.expert.update({
    where: { id: Number(id) },
    data: { deleted: true },
  });
}

export async function undeleteExpert(id: string) {
  return prisma.expert.update({
    where: { id: Number(id) },
    data: { deleted: false },
  });
}
