<<<<<<< HEAD
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const main = async () => {
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedEditor = await bcrypt.hash("editor123", 10);
  const hashedPassword = await bcrypt.hash("123456", 10);
=======
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const main = async () => {
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedEditor = await bcrypt.hash("editor123", 10);
>>>>>>> 85d3238e0ac3f12f942d25ace87a976b60e56442

  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashedAdmin,
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "editor@gmail.com" },
    update: {},
    create: {
      name: "Editor User",
      email: "editor@gmail.com",
      password: hashedEditor,
      role: "editor",
    },
  });
<<<<<<< HEAD

  await prisma.user.create({
    data: {
      email: "nguyenthanhlong@gmail.com",
      password: hashedPassword,
      name: "Nguyen Thanh Long ",
      role: "admin",
    },
  });
=======
>>>>>>> 85d3238e0ac3f12f942d25ace87a976b60e56442
};

main()
  .then(() => console.log("✅ SEED OK!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
