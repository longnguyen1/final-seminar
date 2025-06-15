// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (user && user.password) {
          const isValid = await compare(credentials.password, user.password);
          if (isValid) {
            // chỉ trả về đối tượng minimal cần thiết
            return { id: user.id, email: user.email, name: user.name };
          }
        }
        return null;
      },
    }),
    // … thêm OAuth providers nếu cần
  ],
  callbacks: {
    // Gọi khi tạo JWT
    async jwt({ token, user }) {
      // Lần đầu sign in, user được trả về từ authorize()
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Gọi khi client fetch session
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as number;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
