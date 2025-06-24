// app/admin/experts/[id]/components/PublicationFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
import toast from "react-hot-toast";


interface Publication {
  id?: number;
  title: string;
  year: number | null;
  place: string;
  type: string;
  author: string;
  expertId: number;
}

export default function PublicationFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Publication;
}) {
  const [formData, setFormData] = useState<Publication>({
    title: '',
    year: null,
    place: '',
    type: '',
    author: '',
    expertId: 0,
    ...initialData,
  });

  // Khi initialData thay đổi (chỉnh sửa), cập nhật formData lại
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        year: initialData.year,
        place: initialData.place,
        type: initialData.type,
        author: initialData.author,
        expertId: initialData.expertId,
        id: initialData.id,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? (value === '' ? null : Number(value)) : value,
    }));
  };

  const handleSubmit = async () => {
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id
      ? `/api/publications/${formData.id}`
      : `/api/publications`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    toast.success("💾 Lưu thành công!");
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-xl p-6 space-y-4 bg-white rounded-lg">
        <h2 className="text-lg font-bold">
          {formData.id ? 'Sửa' : 'Thêm'} công trình khoa học
        </h2>

        <div className="space-y-3">
          <input
            name="title"
            placeholder="Tên công trình"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border"
          />
          <input
            name="year"
            type="number"
            placeholder="Năm công bố"
            value={formData.year ?? ''}
            onChange={handleChange}
            className="w-full p-2 border"
          />
          <input
            name="place"
            placeholder="Tạp chí / Hội nghị"
            value={formData.place}
            onChange={handleChange}
            className="w-full p-2 border"
          />
          <input
            name="type"
            placeholder="Loại công trình"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border"
          />
          <input
            name="author"
            placeholder="Tác giả"
            value={formData.author}
            onChange={handleChange}
            className="w-full p-2 border"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-gray-400 rounded"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-blue-600 rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
