// app/admin/experts/[id]/components/WorkHistorySection.tsx
'use client';

import { useEffect, useState } from 'react';
import WorkHistoryFormModal from './WorkHistoryFormModal';

interface WorkHistory {
  id: number;
  startYear: number | null;
  endYear: number | null;
  position: string;
  workplace: string;
  field: string;
  expertId: number;
}

export default function WorkHistorySection({ expertId }: { expertId: number }) {
  const [items, setItems] = useState<WorkHistory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkHistory | undefined>();

  const fetchData = async () => {
    const res = await fetch(`/api/experts/${expertId}/workHistories`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchData();
  }, [expertId]);

  const handleDelete = async (id: number) => {
    if (confirm('Xác nhận xóa?')) {
      await fetch(`/api/workHistories/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Lịch sử công tác</h2>
        <button
          onClick={() => {
            setEditing(undefined);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ➕ Thêm
        </button>
      </div>

      <table className="min-w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Thời gian</th>
            <th className="p-2 border">Chức vụ</th>
            <th className="p-2 border">Nơi công tác</th>
            <th className="p-2 border">Lĩnh vực</th>
            <th className="p-2 border">#</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-2 border text-center">{item.startYear} - {item.endYear}</td>
              <td className="p-2 border">{item.position}</td>
              <td className="p-2 border">{item.workplace}</td>
              <td className="p-2 border">{item.field}</td>
              <td className="p-2 border text-center space-x-2">
                <button onClick={() => { setEditing(item); setIsModalOpen(true); }} className="text-blue-600">✏️</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <WorkHistoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchData}
        initialData={editing ? { ...editing } : { expertId }}
      />
    </div>
  );
}
