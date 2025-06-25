// lib/handlers/projectHandlers.ts
import { prisma } from "../prisma";

export async function getAllProjects() {
  return prisma.project.findMany({
    where: { deleted: false },
  });
}

export async function createProject(data: any) {
  return prisma.project.create({
    data,
  });
}

export async function getProjectById(id: number) {
  return prisma.project.findUnique({
    where: { id },
  });
}

export async function updateProject(id: number, data: any) {
  return prisma.project.update({
    where: { id },
    data,
  });
}

export async function softDeleteProject(id: number) {
  return prisma.project.update({
    where: { id },
    data: { deleted: true },
  });
}

export async function undeleteProject(id: number) {
  return prisma.project.update({
    where: { id },
    data: { deleted: false },
  });
}

export async function getProjectsOfExpert(expertId: number) {
  return prisma.project.findMany({
    where: {
      expertId,
      deleted: false,
    },
  });
}
