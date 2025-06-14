// app/admin/experts/[id]/components/PublicationFormModal.tsx
'use client';

import { useState, useEffect } from 'react';

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

    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-xl space-y-4">
        <h2 className="text-lg font-bold">
          {formData.id ? 'Sửa' : 'Thêm'} công trình khoa học
        </h2>

        <div className="space-y-3">
          <input
            name="title"
            placeholder="Tên công trình"
            value={formData.title}
            onChange={handleChange}
            className="border p-2 w-full"
          />
          <input
            name="year"
            type="number"
            placeholder="Năm công bố"
            value={formData.year ?? ''}
            onChange={handleChange}
            className="border p-2 w-full"
          />
          <input
            name="place"
            placeholder="Tạp chí / Hội nghị"
            value={formData.place}
            onChange={handleChange}
            className="border p-2 w-full"
          />
          <input
            name="type"
            placeholder="Loại công trình"
            value={formData.type}
            onChange={handleChange}
            className="border p-2 w-full"
          />
          <input
            name="author"
            placeholder="Tác giả"
            value={formData.author}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
