// app/admin/experts/[id]/components/PublicationSection.tsx
'use client';

import { useEffect, useState } from 'react';
import PublicationFormModal from './PublicationFormModal';
import toast from "react-hot-toast";


interface Publication {
  id: number;
  title: string;
  year: number;
  place: string;
  type: string;
  author: string;
  expertId: number;
}

export default function PublicationSection({ expertId }: { expertId: number }) {
  const [items, setItems] = useState<Publication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Publication | undefined>();

  const fetchData = async () => {
    const res = await fetch(`/api/experts/${expertId}/publications`);
    const data: Publication[] = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchData();
  }, [expertId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Xác nhận xóa?')) return;
    await fetch(`/api/publications/${id}`, { method: 'DELETE' });
    fetchData();
    toast.success("🗑️ Xoá thành công!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Công trình khoa học</h2>
        <button
          onClick={() => {
            setEditing(undefined);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-white bg-blue-600 rounded"
        >
          ➕ Thêm
        </button>
      </div>

      <table className="min-w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">STT</th>
            <th className="p-2 border">Năm</th>
            <th className="p-2 border">Tên bài</th>
            <th className="p-2 border">Tạp chí / Hội nghị</th>
            <th className="p-2 border">Loại</th>
            <th className="p-2 border">Tác giả</th>
            <th className="p-2 border">#</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              {/* Dùng index từ callback */}
              <td className="p-2 text-center border">{index + 1}</td>
              <td className="p-2 text-center border">{item.year}</td>
              <td className="p-2 border">{item.title}</td>
              <td className="p-2 border">{item.place}</td>
              <td className="p-2 border">{item.type}</td>
              <td className="p-2 border">{item.author}</td>
              <td className="p-2 space-x-2 text-center border">
                <button
                  onClick={() => {
                    setEditing(item);
                    setIsModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <PublicationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchData}
        initialData={
          editing
            ? { ...editing }
            : {
                expertId,
                title: '',
                year: new Date().getFullYear(),
                place: '',
                type: '',
                author: '',
              }
        }
      />
    </div>
  );
}
