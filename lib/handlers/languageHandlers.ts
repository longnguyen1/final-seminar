// lib/handlers/languageHandlers.ts
import { prisma } from "../prisma";

export async function getAllLanguages() {
  return prisma.language.findMany({
    where: { deleted: false },
  });
}

export async function createLanguage(data: any) {
  return prisma.language.create({
    data,
  });
}

export async function getLanguageById(id: string) {
  return prisma.language.findUnique({
    where: { id: Number(id) },
  });
}

export async function updateLanguage(id: string, data: any) {
  return prisma.language.update({
    where: { id: Number(id) },
    data,
  });
}

export async function softDeleteLanguage(id: string) {
  return prisma.language.update({
    where: { id: Number(id) },
    data: { deleted: true },
  });
}

export async function undeleteLanguage(id: string) {
  return prisma.language.update({
    where: { id: Number(id) },
    data: { deleted: false },
  });
}

export async function getLanguagesOfExpert(expertId: string) {
  return prisma.language.findMany({
    where: {
      expertId: Number(expertId),
      deleted: false,
    },
  });
}
