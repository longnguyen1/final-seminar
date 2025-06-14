// app/admin/experts/[id]/components/ProjectSection.tsx
'use client';

import { useEffect, useState } from 'react';
import ProjectFormModal from './ProjectFormModal';

interface Project {
  id: number;
  title: string;
  startYear: number | null;
  endYear: number | null;
  status: string;
  role: string;
  expertId: number;
}

export default function ProjectSection({ expertId }: { expertId: number }) {
  const [items, setItems] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();

  const fetchData = async () => {
    const res = await fetch(`/api/experts/${expertId}/projects`);
    const data: Project[] = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchData();
  }, [expertId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Xác nhận xóa?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Đề tài / Dự án</h2>
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
            <th className="p-2 border">STT</th>
            <th className="p-2 border">Năm</th>
            <th className="p-2 border">Tên đề tài</th>
            <th className="p-2 border">Vai trò</th>
            <th className="p-2 border">Tình trạng</th>
            <th className="p-2 border">#</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              {/* STT */}
              <td className="p-2 border text-center">{index + 1}</td>
              <td className="p-2 border text-center">
                {item.startYear ?? '-'}
                {item.endYear != null ? ` – ${item.endYear}` : ''}
              </td>
              <td className="p-2 border">{item.title}</td>
              <td className="p-2 border">{item.role}</td>
              <td className="p-2 border">{item.status}</td>
              <td className="p-2 border text-center space-x-2">
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

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchData}
        initialData={
          editing
            ? { ...editing }
            : {
                expertId,
                title: '',
                startYear: null,
                endYear: null,
                status: '',
                role: '',
              }
        }
      />
    </div>
  );
}
