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

export async function getLanguageById(id: number) {
  return prisma.language.findUnique({
    where: { id },
  });
}

export async function updateLanguage(id: number, data: any) {
  return prisma.language.update({
    where: { id },
    data,
  });
}

export async function softDeleteLanguage(id: number) {
  return prisma.language.update({
    where: { id },
    data: { deleted: true },
  });
}

export async function undeleteLanguage(id: number) {
  return prisma.language.update({
    where: { id },
    data: { deleted: false },
  });
}

export async function getLanguagesOfExpert(expertId: number) {
  return prisma.language.findMany({
    where: {
      expertId,
      deleted: false,
    },
  });
}
