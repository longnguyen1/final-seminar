"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ThemeProvider, useTheme } from "@/lib/context/ThemeContext";

export default function Wrapper() {
  return (
    <ThemeProvider>
      <PublicExpertDetailPage />
    </ThemeProvider>
  );
}

function PublicExpertDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);

  const { theme, toggleTheme } = useTheme();
  const [expert, setExpert] = useState<any>(null);

  useEffect(() => {
    const fetchExpert = async () => {
      const res = await fetch(`/api/experts/${id}`);
      const data = await res.json();
<<<<<<< HEAD
      console.log("Expert data:", data);
=======
>>>>>>> 85d3238e0ac3f12f942d25ace87a976b60e56442
      setExpert(data);
    };
    fetchExpert();
  }, [id]);

  if (!expert) return <p className="p-8">Đang tải...</p>;

  return (
    <div className="min-h-screen p-8 transition-colors bg-base-100 text-base-content">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{expert.fullName}</h1>
        <button onClick={toggleTheme} className="btn btn-outline">
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      {/* Thông tin chung */}
      <div className="p-6 mb-8 shadow card bg-base-200">
        <h2 className="mb-4 text-xl font-semibold">Thông tin chung</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <p><strong>Học vị:</strong> {expert.degree ?? "-"}</p>
          <p><strong>Năm sinh:</strong> {expert.birthYear ?? "-"}</p>
          <p><strong>Đơn vị:</strong> {expert.organization ?? "-"}</p>
          <p><strong>Email:</strong> {expert.email ?? "-"}</p>
          <p><strong>Điện thoại:</strong> {expert.phone ?? "-"}</p>
        </div>
      </div>

      {/* Các bảng con */}
      <Section title="Học vấn">
<<<<<<< HEAD
        <Table
          columns={["Năm", "Trường", "Ngành"]}
          rows={(expert.educations ?? []).map((e: any) => [e.year, e.school, e.major])}
        />
      </Section>

      <Section title="Công tác">
        <Table
          columns={["Từ năm", "Đến năm", "Chức vụ", "Nơi công tác"]}
          rows={(expert.workHistories ?? []).map((w: any) => [w.startYear, w.endYear, w.position, w.workplace])}
        />
      </Section>

      <Section title="Công trình KH">
        <Table
          columns={["Năm", "Nơi công bố", "Tiêu đề", "Loại", "Tác giả"]}
          rows={(expert.publications ?? []).map((p: any) => [p.year, p.place, p.title, p.type, p.author])}
        />
      </Section>

      <Section title="Dự án">
        <Table
          columns={["Từ năm", "Đến năm", "Tiêu đề", "Trạng thái", "Vai trò"]}
          rows={(expert.projects ?? []).map((p: any) => [p.startYear ?? "-", p.endYear ?? "-", p.title, p.status, p.role])}
        />
      </Section>

      <Section title="Ngoại ngữ">
        <Table
          columns={["Ngôn ngữ", "Nghe", "Nói", "Đọc", "Viết"]}
          rows={(expert.languages ?? []).map((l: any) => [l.language, l.listening, l.speaking, l.reading, l.writing])}
        />
=======
        <Table columns={["Năm", "Trường", "Ngành"]} rows={expert.educations.map((e: any) => [e.year, e.school, e.major])} />
      </Section>

      <Section title="Công tác">
        <Table columns={["Từ năm", "Đến năm", "Chức vụ", "Nơi công tác"]} rows={expert.workHistories.map((w: any) => [w.startYear, w.endYear, w.position, w.workplace])} />
      </Section>

      <Section title="Công trình KH">
        <Table columns={["Năm", "Nơi công bố", "Tiêu đề", "Loại", "Tác giả"]} rows={expert.publications.map((p: any) => [p.year, p.place, p.title, p.type, p.author])} />
      </Section>

      <Section title="Dự án">
        <Table columns={["Từ năm", "Đến năm", "Tiêu đề", "Trạng thái", "Vai trò"]} rows={expert.projects.map((p: any) => [p.startYear ?? "-", p.endYear ?? "-", p.title, p.status, p.role])} />
      </Section>

      <Section title="Ngoại ngữ">
        <Table columns={["Ngôn ngữ", "Nghe", "Nói", "Đọc", "Viết"]} rows={expert.languages.map((l: any) => [l.language, l.listening, l.speaking, l.reading, l.writing])} />
>>>>>>> 85d3238e0ac3f12f942d25ace87a976b60e56442
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Table({ columns, rows }: { columns: string[], rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full border table-zebra border-base-content border-opacity-20">
        <thead className="bg-base-200">
          <tr>{columns.map(col => <th key={col}>{col}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-base-content border-opacity-20">
              {row.map((cell, i) => <td key={i}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
