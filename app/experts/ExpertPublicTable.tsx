"use client";

import Link from "next/link";
import { getDegreePrefix } from "@/lib/utils/getDegreePrefix";

interface Expert {
  id: string | number;
  fullName: string;
  degree?: string;
  organization?: string;
}

interface ExpertPublicTableProps {
  experts: Expert[];
  page: number;
  setPage: (p: number | ((prev: number) => number)) => void;
  total: number;
  theme?: "light" | "dark";
}

export default function ExpertPublicTable({ experts, page, setPage, total, theme = "light" }: ExpertPublicTableProps) {
  const safeExperts = Array.isArray(experts) ? experts : [];
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  // Tạo mảng số trang, tối đa 7 nút (có ... nếu nhiều trang)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const isDark = theme === "dark";

  return (
    <div className={`mt-4 overflow-x-auto rounded shadow ${isDark ? "bg-gray-800" : "bg-white"}`}>
      <table className={`min-w-full text-sm text-left ${isDark ? "text-gray-100" : "text-gray-800"}`}>
        <thead className={`text-sm font-semibold uppercase ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Họ tên</th>
            <th className="px-4 py-2">Học vị</th>
            <th className="px-4 py-2">Đơn vị</th>
          </tr>
        </thead>
        <tbody>
          {safeExperts.map((expert, idx) => (
            <tr key={expert.id} className={`${isDark ? "border-b border-gray-700 hover:bg-gray-700" : "border-b hover:bg-gray-50"}`}>
              <td className="px-4 py-2">{idx + 1 + (page - 1) * pageSize}</td>
              <td className="px-4 py-2 text-blue-500 hover:underline">
                <Link href={`/experts/${expert.id}`}>
                  {getDegreePrefix(expert.degree)} {expert.fullName}
                </Link>
              </td>
              <td className="px-4 py-2">{expert.degree ?? "-"}</td>
              <td className="px-4 py-2">{expert.organization ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Thanh phân trang dạng số, màu sáng/tối */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`px-3 py-1 rounded border font-medium transition
            ${isDark
              ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"}
            ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          «
        </button>
        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span key={idx} className={`px-2 select-none ${isDark ? "text-gray-400" : "text-gray-400"}`}>...</span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(Number(p))}
              className={`px-3 py-1 rounded border font-medium transition
                ${page === p
                  ? isDark
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-blue-500 text-white border-blue-500"
                  : isDark
                    ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"}
              `}
              disabled={page === p}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
          className={`px-3 py-1 rounded border font-medium transition
            ${isDark
              ? "bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"}
            ${page === totalPages || totalPages === 0 ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          »
        </button>
      </div>
    </div>
  );
}


