"use client"
import Image from "next/image";
import Link from "next/link";
import ChatBox from "@/components/ChatBox";
import dynamic from "next/dynamic";

const Chart = dynamic(() =>
  import('@/components/ExpertChart').then(mod => mod.ExpertChart)
);

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-white">
      <main className="px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block xl:inline">Web quản lý chuyên gia (các nhà khoa học)</span>{" "}
            <span className="block text-indigo-600 xl:inline">có kết hợp thêm với AI</span>
          </h1>
          <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-600">
            Tìm kiếm chuyên gia, truy xuất công trình, tương tác thông minh với chatbot AI hỗ trợ toàn diện.
          </p>
          <div className="flex justify-center gap-4 mt-10">
            <Link
              href="/experts"
              className="inline-block px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Tra cứu chuyên gia
            </Link>
            <Link
              href="/experts/rank"
              className="inline-block px-6 py-3 text-base font-medium text-indigo-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Xếp hạng chuyên gia
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex justify-center mt-16">
          <Image src="/hero-image.svg" alt="AI Tra cứu" width={600} height={400} />
        </div>

        {/* Features section */}
        <div className="grid grid-cols-1 gap-12 mt-24 text-center md:grid-cols-3">
          <div>
            <h3 className="text-xl font-semibold text-indigo-600">60+ Chuyên gia</h3>
            <p className="mt-2 text-gray-600">Dữ liệu chuyên gia được cập nhật thường xuyên từ nhiều lĩnh vực.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-indigo-600">700+ Công trình khoa học</h3>
            <p className="mt-2 text-gray-600">Trích xuất và thống kê nhanh chóng các công trình khoa học.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-indigo-600">Chatbot rasa + chatgpt openAI</h3>
            <p className="mt-2 text-gray-600">Hỗ trợ hội thoại tự nhiên với khả năng tra cứu thông tin tức thời.</p>
          </div>
        </div>

        {/* Chart section 
        <div className="mt-24">
          <h2 className="mb-6 text-2xl font-bold text-center">Thống kê chuyên gia theo lĩnh vực</h2>
          <Chart />
        </div>
        */}
      </main>
    </div>
  );
}
