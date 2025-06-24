import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);
await prisma.user.create({
  data: {
    email: "nguyenthanhlong1@gmail.com",
    password: hashedPassword,
    name: "Nguyen Thanh Long 1",
    role: "editor", // or "admin" for admin user
  },
});
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
