// app/admin/experts/[id]/components/LanguageFormModal.tsx
'use client';

import { useEffect, useState } from 'react';

interface Language {
  id?: number;
  language: string;
  listening: string;
  speaking: string;
  reading: string;
  writing: string;
  expertId: number;
}

const defaultLanguage = (expertId: number): Language => ({
  language: '',
  listening: '',
  speaking: '',
  reading: '',
  writing: '',
  expertId,
});

export default function LanguageFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Language;
}) {
  const [formData, setFormData] = useState<Language>(
    defaultLanguage(initialData?.expertId ?? 0)
  );

  // Khi mở modal hoặc initialData thay đổi, reset formData
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setFormData({
        language: initialData.language ?? '',
        listening: initialData.listening ?? '',
        speaking: initialData.speaking ?? '',
        reading: initialData.reading ?? '',
        writing: initialData.writing ?? '',
        expertId: initialData.expertId,
        id: initialData.id,
      });
    } else {
      setFormData(defaultLanguage(initialData?.expertId ?? formData.expertId));
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id
      ? `/api/languages/${formData.id}`
      : `/api/languages`;

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
          {formData.id ? 'Sửa' : 'Thêm'} ngoại ngữ
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            name="language"
            value={formData.language}
            onChange={handleChange}
            placeholder="Ngoại ngữ"
            className="border p-2"
          />
          <input
            name="listening"
            value={formData.listening}
            onChange={handleChange}
            placeholder="Nghe"
            className="border p-2"
          />
          <input
            name="speaking"
            value={formData.speaking}
            onChange={handleChange}
            placeholder="Nói"
            className="border p-2"
          />
          <input
            name="reading"
            value={formData.reading}
            onChange={handleChange}
            placeholder="Đọc"
            className="border p-2"
          />
          <input
            name="writing"
            value={formData.writing}
            onChange={handleChange}
            placeholder="Viết"
            className="border p-2"
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
