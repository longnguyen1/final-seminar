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
}

export default function ExpertPublicTable({ experts, page, setPage }: ExpertPublicTableProps) {
  return (
    <div className="mt-4 overflow-x-auto bg-white rounded shadow dark:bg-gray-800">
      <table className="min-w-full text-sm text-left text-gray-800 dark:text-gray-200">
        <thead className="text-sm font-semibold uppercase bg-gray-200 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Họ tên</th>
            <th className="px-4 py-2">Học vị</th>
            <th className="px-4 py-2">Đơn vị</th>
          </tr>
        </thead>
        <tbody>
          {experts.map((expert, idx) => (
            <tr key={expert.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-600">
              <td className="px-4 py-2">{idx + 1 + (page - 1) * 10}</td>
              <td className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline">
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

      <div className="flex items-center gap-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev: number) => Math.max(1, prev - 1))}
          className={`btn ${page === 1 ? "btn-disabled" : "btn-primary"}`}
        >
          « Trang trước
        </button>
        <span>Trang {page}</span>
        <button
          disabled={experts.length < 10}
          onClick={() => setPage((prev: number) => prev + 1)}
          className={`btn ${experts.length < 10 ? "btn-disabled" : "btn-primary"}`}
        >
          Trang sau »
        </button>
      </div>
    </div>
  );
}
