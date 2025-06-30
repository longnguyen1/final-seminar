import { Providers } from "./providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hệ thống tra cứu chuyên gia",
  description: "Ứng dụng tra cứu chuyên gia tích hợp AI & Chatbot",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-900`}>
        <Providers>
          <ThemeProvider>
            <header className="sticky top-0 z-50 bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl">
                <h1 className="text-xl font-semibold">🧠 Hệ thống tra cứu chuyên gia</h1>
                <nav className="space-x-6 text-sm font-medium">
                  <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
                  <Link href="/experts" className="hover:text-blue-600">Chuyên gia</Link>
                  <Link href="/experts/rank" className="hover:text-blue-600">Xếp hạng</Link>
                  <Link href="/about" className="hover:text-blue-600">Giới thiệu</Link>
                </nav>
              </div>
            </header>

            <main className="flex-1 min-h-screen px-4 py-6 mx-auto max-w-7xl">{children}</main>
          </ThemeProvider>
          <Toaster position="top-right" />
        </Providers>
        <Footer />
      </body>
    </html>
  );
}
