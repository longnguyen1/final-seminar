import { notFound } from "next/navigation";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { prisma } from "@/lib/prisma";

// Giao diện props cho các thành phần tái sử dụng
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

interface TableProps {
  columns: string[];
  rows: (string | number | null | undefined)[][];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId)) return notFound();

  const expert = await prisma.expert.findUnique({
    where: { id: numId },
    include: {
      educations: true,
      workHistories: true,
      publications: true,
      projects: true,
      languages: true,
    },
  });

  if (!expert) return notFound();


  return (
    <ThemeProvider>
      <div className="min-h-screen p-8 bg-base-100 text-base-content">
        <h1 className="mb-6 text-2xl font-bold">{expert.fullName}</h1>

        <Section title="Thông tin chung">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <p><strong>Học vị:</strong> {expert.degree ?? "-"}</p>
            <p><strong>Năm sinh:</strong> {expert.birthYear ?? "-"}</p>
            <p><strong>Đơn vị:</strong> {expert.organization ?? "-"}</p>
            <p><strong>Email:</strong> {expert.email ?? "-"}</p>
            <p><strong>Điện thoại:</strong> {expert.phone ?? "-"}</p>
          </div>
        </Section>

        <Section title="Học vấn">
          <Table
            columns={["Năm", "Trường", "Ngành"]}
            rows={expert.educations.map((e) => [e.year, e.school, e.major])}
          />
        </Section>

        <Section title="Công tác">
          <Table
            columns={["Từ năm", "Đến năm", "Chức vụ", "Nơi công tác"]}
            rows={expert.workHistories.map((w) => [w.startYear, w.endYear, w.position, w.workplace])}
          />
        </Section>

        <Section title="Công trình KH">
          <Table
            columns={["Năm", "Nơi công bố", "Tiêu đề", "Loại", "Tác giả"]}
            rows={expert.publications.map((p) => [p.year, p.place, p.title, p.type, p.author])}
          />
        </Section>

        <Section title="Dự án">
          <Table
            columns={["Từ năm", "Đến năm", "Tiêu đề", "Trạng thái", "Vai trò"]}
            rows={expert.projects.map((p) => [
              p.startYear ?? "-",
              p.endYear ?? "-",
              p.title,
              p.status,
              p.role,
            ])}
          />
        </Section>

        <Section title="Ngoại ngữ">
          <Table
            columns={["Ngôn ngữ", "Nghe", "Nói", "Đọc", "Viết"]}
            rows={expert.languages.map((l) => [
              l.language,
              l.listening,
              l.speaking,
              l.reading,
              l.writing,
            ])}
          />
        </Section>
      </div>
    </ThemeProvider>
  );
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-10">
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Table({ columns, rows }: TableProps) {
  if (!rows.length) {
    return <p className="text-gray-500">Không có dữ liệu</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full border table-zebra border-base-content border-opacity-20">
        <thead className="bg-base-200">
          <tr>{columns.map((col) => <th key={col}>{col}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, i) => (
                <td key={i}>{cell ?? "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
