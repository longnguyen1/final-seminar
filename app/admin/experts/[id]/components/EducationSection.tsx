// app/admin/experts/[id]/components/EducationSection.tsx
'use client';

import { useEffect, useState } from 'react';
import EducationFormModal from './EducationFormModal';

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
    <div className="bg-white p-6 rounded shadow space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Quá trình đào tạo</h2>
        <button
          onClick={openAdd}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          ➕
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Chưa có bản ghi</p>
      ) : (
        <table className="w-full table-auto text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Năm</th>
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
