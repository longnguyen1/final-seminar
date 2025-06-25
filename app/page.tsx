import Image from "next/image";
import Link from "next/link";
import ChatWidget from "./components/ChatWidget";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <main className="flex flex-col items-center gap-8 mt-16">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="mb-2 text-2xl font-bold text-center">Chào mừng đến với Hệ thống Quản lý Chuyên gia</h1>
        <p className="max-w-xl text-center text-gray-600">
          Bạn có thể tra cứu thông tin chuyên gia, hỏi đáp nhanh với trợ lý AI hoặc khám phá các chức năng quản trị.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/experts"
            className="px-6 py-3 font-semibold text-white transition bg-blue-600 rounded-full shadow hover:bg-blue-700"
          >
            Xem danh sách chuyên gia
          </Link>
        </div>
      </main>
      {/* Hiển thị widget chat Rasa */}
      <ChatWidget />
      <footer>
      </footer>
    </div>
  );
}
