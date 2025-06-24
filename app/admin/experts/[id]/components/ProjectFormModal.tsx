// app/admin/experts/[id]/components/ProjectFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
import toast from "react-hot-toast";


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

    toast.success("💾 Lưu thành công!");
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-xl p-6 space-y-4 bg-white rounded-lg">
        <h2 className="text-lg font-bold">
          {formData.id ? 'Sửa' : 'Thêm'} đề tài / dự án
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="title"
            placeholder="Tên đề tài"
            value={formData.title}
            onChange={handleChange}
            className="p-2 border"
          />
          <input
            name="role"
            placeholder="Vai trò"
            value={formData.role}
            onChange={handleChange}
            className="p-2 border"
          />
          <input
            name="startYear"
            type="number"
            placeholder="Năm bắt đầu"
            value={formData.startYear ?? ''}
            onChange={handleChange}
            className="p-2 border"
          />
          <input
            name="endYear"
            type="number"
            placeholder="Năm kết thúc"
            value={formData.endYear ?? ''}
            onChange={handleChange}
            className="p-2 border"
          />
          <input
            name="status"
            placeholder="Tình trạng"
            value={formData.status}
            onChange={handleChange}
            className="col-span-2 p-2 border"
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
