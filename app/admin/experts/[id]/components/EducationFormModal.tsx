// app/admin/experts/[id]/components/EducationFormModal.tsx
'use client';
import { useState, useEffect } from 'react';

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
    onSaved();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {form.id ? 'Chỉnh sửa học vấn' : 'Thêm học vấn'}
        </h2>
        <div className="space-y-4">
          <input
            name="year"
            type="number"
            value={form.year}
            onChange={handleChange}
            placeholder="Năm"
            className="border p-2 w-full"
          />
          <input
            name="school"
            value={form.school}
            onChange={handleChange}
            placeholder="Trường"
            className="border p-2 w-full"
          />
          <input
            name="major"
            value={form.major}
            onChange={handleChange}
            placeholder="Chuyên ngành"
            className="border p-2 w-full"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
            Hủy
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
            {form.id ? 'Lưu' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
}
