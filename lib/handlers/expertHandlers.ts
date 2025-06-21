// lib/handlers/expertHandlers.ts
import { prisma } from "../prisma";
import { pick } from "lodash";

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

export async function getExpertById(id: number) {
  return prisma.expert.findUnique({
    where: { id },
    include: {
      educations: true,
      workHistories: true,
      publications: true,
      projects: true,
      languages: true,
    },
  });
}

export const updateExpert = async (id: number, data: any) => {
  const allowedFields = [
    "fullName", "birthYear", "gender", "academicTitle", "academicTitleYear",
    "degree", "degreeYear", "position", "currentWork", "organization",
    "email", "phone" // ✅ mới
  ];
  const updateData = pick(data, allowedFields);
  return prisma.expert.update({
    where: { id },
    data: updateData,
  });
};


export async function softDeleteExpert(id: number) {
  return prisma.expert.update({
    where: { id },
    data: { deleted: true },
  });
}

export async function undeleteExpert(id: number) {
  return prisma.expert.update({
    where: { id },
    data: { deleted: false },
  });
}
