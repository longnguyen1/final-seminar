// app/admin/experts/[id]/components/EducationSection.tsx
'use client';

import { useEffect, useState } from 'react';
import EducationFormModal from './EducationFormModal';
import toast from "react-hot-toast";

interface Education {
  id: number;
  year: number;
  school: string;
  major: string;
  expertId: number;
}

export default function EducationSection({ expertId }: { expertId: number }) {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  // modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Education | undefined>(undefined);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/experts/${expertId}/educations`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [expertId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa bản ghi này?')) return;
    await fetch(`/api/educations/${id}`, { method: 'DELETE' });
    fetchData();
    toast.success("🗑️ Xoá thành công!");
  };

  const openAdd = () => {
    setSelected(undefined);
    setIsModalOpen(true);
  };
  const openEdit = (e: Education) => {
    setSelected(e);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-4 bg-white rounded shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quá trình đào tạo</h2>
        <button
          onClick={openAdd}
          className="px-3 py-1 text-white bg-green-600 rounded"
        >
          ➕
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Chưa có bản ghi</p>
      ) : (
        <table className="w-full text-sm border table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Năm tốt nghiệp</th>
              <th className="p-2">Trường</th>
              <th className="p-2">Chuyên ngành</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e, i) => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{e.year}</td>
                <td className="p-2">{e.school}</td>
                <td className="p-2">{e.major}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => openEdit(e)}
                    className="text-blue-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-red-600"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Controlled Modal */}
      <EducationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchData}
        initial={selected ? { ...selected } : { expertId, year: new Date().getFullYear(), school: '', major: '' }}
      />
    </div>
  );
}
