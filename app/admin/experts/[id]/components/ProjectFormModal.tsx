// app/admin/experts/[id]/components/ProjectFormModal.tsx
'use client';

import { useState, useEffect } from 'react';

interface Project {
  id?: number;
  title: string;
  startYear: number | null;
  endYear: number | null;
  status: string;
  role: string;
  expertId: number;
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Project;
}) {
  const [formData, setFormData] = useState<Project>({
    title: '',
    startYear: null,
    endYear: null,
    status: '',
    role: '',
    expertId: 0,
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: 
        name === 'startYear' || name === 'endYear'
          ? (value === '' ? null : Number(value))
          : value,
    }));
  };

  const handleSubmit = async () => {
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id
      ? `/api/projects/${formData.id}`
      : `/api/projects`;

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
          {formData.id ? 'Sửa' : 'Thêm'} đề tài / dự án
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="title"
            placeholder="Tên đề tài"
            value={formData.title}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="role"
            placeholder="Vai trò"
            value={formData.role}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="startYear"
            type="number"
            placeholder="Năm bắt đầu"
            value={formData.startYear ?? ''}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="endYear"
            type="number"
            placeholder="Năm kết thúc"
            value={formData.endYear ?? ''}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="status"
            placeholder="Tình trạng"
            value={formData.status}
            onChange={handleChange}
            className="border p-2 col-span-2"
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
