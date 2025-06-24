// lib/handlers/expertHandlers.ts
import { prisma } from "../prisma";
import { writeLog } from "./logHandlers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { pick } from "lodash";
import bcrypt from "bcryptjs";

// ✅ NEW: Hàm lấy danh sách Expert với skip/take
export const getExperts = async (skip = 0, take = 10) => {
  return prisma.expert.findMany({
    where: { deleted: false },
    skip,
    take,
    orderBy: { id: "asc" },
  });
};

// ✅ Lấy chi tiết 1 Expert
export const getExpertById = async (id: number) => {
  return prisma.expert.findUnique({
    where: { id },
  });
};

// ✅ Tạo mới Expert
export const createExpert = async (data: any) => {
  const expert = await prisma.expert.create({ data });

  const session = await getServerSession(authOptions);
  if (session) {
    await writeLog(session.user.email ?? "unknown", "CREATE", "Expert", expert.id, `Created ${expert.fullName}`);
  }

  return expert;
};

// ✅ Update Expert
export const updateExpert = async (id: number, data: any) => {
  // Nếu có trường password, hash lại
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return prisma.expert.update({
    where: { id },
    data,
  });
};

// ✅ Xoá mềm Expert
export const softDeleteExpert = async (id: number) => {
  return prisma.expert.update({
    where: { id },
    data: { deleted: true },
  });
};
