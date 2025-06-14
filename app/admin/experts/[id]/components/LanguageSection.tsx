'use client';

import { useEffect, useState } from 'react';
import LanguageFormModal from './LanguageFormModal';

interface Language {
  id: number;
  language: string;
  listening: string;
  speaking: string;
  reading: string;
  writing: string;
  expertId: number;
}

export default function LanguageSection({ expertId }: { expertId: number }) {
  const [items, setItems] = useState<Language[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Language | undefined>();

  const fetchData = async () => {
    const res = await fetch(`/api/experts/${expertId}/languages`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    fetchData();
  }, [expertId]);

  const handleDelete = async (id: number) => {
    if (confirm('Xác nhận xóa?')) {
      await fetch(`/api/languages/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Trình độ ngoại ngữ</h2>
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
            <th className="p-2 border">Ngôn ngữ</th>
            <th className="p-2 border">Nghe</th>
            <th className="p-2 border">Nói</th>
            <th className="p-2 border">Đọc</th>
            <th className="p-2 border">Viết</th>
            <th className="p-2 border">#</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-2 border">{item.language}</td>
              <td className="p-2 border">{item.listening}</td>
              <td className="p-2 border">{item.speaking}</td>
              <td className="p-2 border">{item.reading}</td>
              <td className="p-2 border">{item.writing}</td>
              <td className="p-2 border text-center space-x-2">
                <button onClick={() => { setEditing(item); setIsModalOpen(true); }} className="text-blue-600">✏️</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <LanguageFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchData}
        initialData={editing ? { ...editing } : { expertId }}
      />
    </div>
  );
}
