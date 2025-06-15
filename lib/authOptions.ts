import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

import type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
  interface User {
    role?: string;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role?: string;
  }
}

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Email và mật khẩu là bắt buộc");
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("Email không tồn tại");
        if (!user.password) throw new Error("Tài khoản không hợp lệ");
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error("Mật khẩu sai");

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "",
          role: user.role, // ✅ cần có role
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = typeof token.role === "string" ? token.role : undefined;
      }
      return session;
    },
  },
};
