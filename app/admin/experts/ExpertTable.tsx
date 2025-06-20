"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ExpertFormModal from './ExpertFormModal';

interface Expert {
  id: number;
  fullName: string;
  birthYear: number | null;
  organization: string | null;
}

export default function ExpertTable() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);

  const fetchExperts = async () => {
    const res = await fetch('/api/experts');
    const data = await res.json();
    setExperts(data);
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleAdd = () => {
    setEditingExpert(null); // thêm mới: không có expert
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
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      <div className="mb-4">
        <button
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          onClick={handleAdd}
        >
          ➕ Thêm chuyên gia
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
              <th className="px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {experts.map((expert, index) => (
              <tr key={expert.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2 text-blue-700 hover:underline">
                  <Link href={`/admin/experts/${expert.id}`}>
                    {expert.fullName}
                  </Link>
                </td>
                <td className="px-4 py-2">{expert.birthYear ?? '-'}</td>
                <td className="px-4 py-2">{expert.organization ?? '-'}</td>
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

      <ExpertFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchExperts}
        expert={editingExpert ? { ...editingExpert, organization: editingExpert.organization ?? undefined } : undefined} // 👈 khi sửa thì truyền data, thêm mới thì null
      />
    </div>
  );
}
