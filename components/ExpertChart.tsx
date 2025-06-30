// components/ExpertChart.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { field: "CNTT", experts: 80 },
  { field: "Y học", experts: 45 },
  { field: "Kinh tế", experts: 30 },
  { field: "Giáo dục", experts: 25 },
  { field: "Khác", experts: 20 },
];

export function ExpertChart() {
  return (
    <div className="w-full p-4 bg-white shadow h-80 rounded-xl">
      <h3 className="mb-4 text-lg font-semibold">Phân bố chuyên gia theo lĩnh vực</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="field" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="experts" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// app/about/page.tsx
export function AboutPage() {
  return (
    <div className="max-w-4xl px-4 py-10 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Giới thiệu hệ thống</h1>
      <p>
        Hệ thống tra cứu chuyên gia kết hợp trí tuệ nhân tạo giúp người dùng nhanh chóng tìm kiếm thông tin chuyên gia, công trình khoa học và hỗ trợ qua chatbot thông minh.
      </p>
    </div>
  );
}

// app/contact/page.tsx
export function ContactPage() {
  return (
    <div className="max-w-3xl px-4 py-10 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Liên hệ / Góp ý</h1>
      <form className="space-y-4">
        <input type="text" placeholder="Tên của bạn" className="w-full p-2 border rounded" />
        <input type="email" placeholder="Email" className="w-full p-2 border rounded" />
        <textarea placeholder="Góp ý hoặc báo lỗi..." className="w-full h-32 p-2 border rounded" />
        <button type="submit" className="px-4 py-2 text-white bg-blue-500 rounded">Gửi</button>
      </form>
    </div>
  );
}

// app/api-demo/page.tsx
export function ApiDemoPage() {
  return (
    <div className="max-w-4xl px-4 py-10 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Hướng dẫn sử dụng API</h1>
      <ul className="ml-6 space-y-2 list-disc">
        <li><code>/api/experts/search?name=...</code>: Tìm chuyên gia theo tên.</li>
        <li><code>/api/experts/by-field?field=...</code>: Lọc chuyên gia theo lĩnh vực.</li>
        <li><code>/api/educations/by-expert-id?id=...</code>: Xem học vấn.</li>
        <li><code>/api/publications/by-expert-id?id=...</code>: Xem công trình.</li>
      </ul>
    </div>
  );
}
