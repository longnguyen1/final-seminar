// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  // đổi mật khẩu thành "123456"
  const hash = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "admin@yourdomain.com" },
    update: {
      // nếu cần bạn cũng có thể cập nhật luôn mật khẩu ở đây
      password: hash,
    },
    create: {
      email: "nguyenthanhlong601@gmail.com",
      name: "Admin",
      password: hash,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
