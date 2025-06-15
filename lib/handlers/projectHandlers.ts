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

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id: Number(id) },
  });
}

export async function updateProject(id: string, data: any) {
  return prisma.project.update({
    where: { id: Number(id) },
    data,
  });
}

export async function softDeleteProject(id: string) {
  return prisma.project.update({
    where: { id: Number(id) },
    data: { deleted: true },
  });
}

export async function undeleteProject(id: string) {
  return prisma.project.update({
    where: { id: Number(id) },
    data: { deleted: false },
  });
}

export async function getProjectsOfExpert(expertId: string) {
  return prisma.project.findMany({
    where: {
      expertId: Number(expertId),
      deleted: false,
    },
  });
}
