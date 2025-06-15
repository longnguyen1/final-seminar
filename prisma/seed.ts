import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);
await prisma.user.create({
  data: {
    email: "nguyenthanhlong601@gmail.com",
    password: hashedPassword,
    name: "Nguyen Thanh Long",
  },
});

}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
