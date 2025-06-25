import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);
await prisma.user.create({
  data: {
    email: "nguyenthanhlong1@gmail.com",
    password: hashedPassword,
<<<<<<< HEAD
    name: "Nguyen Thanh Long 1 ",
    role: "admin", // or "admin" for admin user
=======
    name: "Nguyen Thanh Long 1",
    role: "editor", // or "admin" for admin user
>>>>>>> 85d3238e0ac3f12f942d25ace87a976b60e56442
  },
});
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
