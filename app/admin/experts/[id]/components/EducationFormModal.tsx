// app/admin/experts/[id]/components/EducationFormModal.tsx
'use client';
import { useState, useEffect } from 'react';
import toast from "react-hot-toast";

interface EducationData {
  id?: number;
  year: number;
  school: string;
  major: string;
  expertId: number;
}

export default function EducationFormModal({
  isOpen,
  onClose,
  onSaved,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: EducationData;
}) {
  const [form, setForm] = useState<EducationData>({
    year: new Date().getFullYear(),
    school: '',
    major: '',
    expertId: initial?.expertId ?? 0,
    id: initial?.id,
  });

  useEffect(() => {
    if (initial) {
      setForm(initial);
    }
  }, [initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'year' ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id
      ? `/api/educations/${form.id}`
      : '/api/educations';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    toast.success("💾 Lưu thành công!");
    onSaved();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg">
        <h2 className="mb-4 text-xl font-bold">
          {form.id ? 'Chỉnh sửa học vấn' : 'Thêm học vấn'}
        </h2>
        <div className="space-y-4">
          <input
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            placeholder="Năm"
            className="w-full p-2 border"
          />
          <input
            name="school"
            value={form.school}
            onChange={handleChange}
            placeholder="Trường"
            className="w-full p-2 border"
          />
          <input
            name="major"
            value={form.major}
            onChange={handleChange}
            placeholder="Chuyên ngành"
            className="w-full p-2 border"
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-white bg-gray-400 rounded">
            Hủy
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 text-white bg-blue-600 rounded">
            {form.id ? 'Lưu' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
}
