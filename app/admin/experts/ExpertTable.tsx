"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ExpertFormModal from './ExpertFormModal';
import { getDegreePrefix } from "@/lib/utils/getDegreePrefix";
import Papa from "papaparse";
import toast from "react-hot-toast";

interface Expert {
  id: number;
  fullName: string;
  birthYear: number | null;
  organization: string | null;
  degree?: string | null;
  email?: string | null;
  phone?: string | null;
}

export default function ExpertTable() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filtered, setFiltered] = useState<Expert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);

  const [filters, setFilters] = useState({
    name: "",
    degree: "",
    organization: "",
  });

  const [page, setPage] = useState(1);

  const fetchExperts = async () => {
    const res = await fetch(`/api/experts?page=${page}`);
    const data = await res.json();
    setExperts(data);
    setFiltered(data);
  };

  useEffect(() => {
    fetchExperts();
  }, [page]);

  useEffect(() => {
    let temp = [...experts];
    if (filters.name) {
      temp = temp.filter(ex =>
        ex.fullName?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.degree) {
      temp = temp.filter(ex => ex.degree === filters.degree);
    }
    if (filters.organization) {
      temp = temp.filter(ex => ex.organization === filters.organization);
    }
    setFiltered(temp);
  }, [filters, experts]);

  const handleAdd = () => {
    setEditingExpert(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expert: Expert) => {
    setEditingExpert(expert);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn chắc chắn muốn xoá chuyên gia này?')) return;
    await fetch(`/api/experts/${id}`, { method: 'DELETE' });
    fetchExperts();
    toast.success("🗑️ Xoá thành công!");
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error("Không có dữ liệu để export!");
      return;
    }

    const csv = Papa.unparse(
      filtered.map(({ id, fullName, birthYear, organization, degree, email, phone }) => ({
        ID: id,
        HọTên: fullName,
        NămSinh: birthYear ?? "",
        ĐơnVị: organization ?? "",
        HọcVị: degree ?? "",
        Email: email ?? "",
        Phone: phone ?? "",
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "chuyen_gia.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("📥 Đã export CSV thành công!");
  };

  const degreeOptions = Array.from(new Set(experts.map(ex => ex.degree).filter(Boolean)));
  const orgOptions = Array.from(new Set(experts.map(ex => ex.organization).filter(Boolean)));

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          placeholder="🔍 Tìm tên..."
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="p-2 border"
        />
        <select
          value={filters.degree}
          onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
          className="p-2 border"
        >
          <option value="">🎓 Tất cả học vị</option>
          {degreeOptions.map((deg) => (
            <option key={deg ?? ''} value={deg ?? ''}>
              {deg ?? ''}
            </option>
          ))}
        </select>
        <select
          value={filters.organization}
          onChange={(e) => setFilters({ ...filters, organization: e.target.value })}
          className="p-2 border"
        >
          <option value="">🏢 Tất cả đơn vị</option>
          {orgOptions.map((org) => (
            <option key={org ?? ''} value={org ?? ''}>
              {org ?? ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <button
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          onClick={handleAdd}
        >
          ➕ Thêm chuyên gia
        </button>

        <button
          className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
          onClick={handleExport}
        >
          📥 Export CSV
        </button>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <table className="min-w-full text-sm text-left text-gray-800">
          <thead className="text-sm font-semibold text-gray-900 uppercase bg-gray-200">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Họ tên</th>
              <th className="px-4 py-2">Năm sinh</th>
              <th className="px-4 py-2">Đơn vị</th>
              <th className="px-4 py-2">Liên hệ</th>
              <th className="px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((expert, index) => (
              <tr key={expert.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1 + (page - 1) * 10}</td>
                <td className="px-4 py-2 text-blue-700 hover:underline">
                  <Link href={`/admin/experts/${expert.id}`}>
                    {getDegreePrefix(expert.degree)}{expert.fullName}
                  </Link>
                </td>
                <td className="px-4 py-2">{expert.birthYear ?? '-'}</td>
                <td className="px-4 py-2">{expert.organization ?? '-'}</td>
                <td className="px-4 py-2">
                  {expert.phone && (
                    <div className="flex items-center gap-1">
                      📞 <span>{expert.phone}</span>
                    </div>
                  )}
                  {expert.email && (
                    <div className="flex items-center gap-1">
                      📧 <span>{expert.email}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEdit(expert)}
                    className="px-2 py-1 text-white bg-yellow-400 rounded hover:bg-yellow-500"
                  >
                    🖊️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(expert.id)}
                    className="px-2 py-1 text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    🗑️ Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nút phân trang */}
      <div className="flex items-center gap-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className={`px-3 py-1 rounded ${page === 1 ? "bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          « Trang trước
        </button>

        <span>Trang {page}</span>

        <button
          disabled={filtered.length < 10}
          onClick={() => setPage((prev) => prev + 1)}
          className={`px-3 py-1 rounded ${filtered.length < 10 ? "bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
        >
          Trang sau »
        </button>
      </div>

      <ExpertFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchExperts}
        expert={editingExpert || undefined}
      />
    </div>
  );
}
