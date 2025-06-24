'use client';

import { useState, useEffect } from 'react';
import toast from "react-hot-toast";


interface Language {
  id?: number;
  language: string;
  listening: string;
  speaking: string;
  reading: string;
  writing: string;
  expertId: number;
}

export const defaultLanguage = (expertId: number): Language => ({
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
      setFormData(defaultLanguage(formData.expertId));
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
    toast.success("💾 Lưu thành công!");
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-xl p-6 space-y-4 bg-white rounded-lg">
        <h2 className="text-lg font-bold">
          {formData.id ? 'Sửa' : 'Thêm'} ngoại ngữ
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            name="language"
            value={formData.language}
            onChange={handleChange}
            placeholder="Ngoại ngữ"
            className="p-2 border"
          />
          <input
            name="listening"
            value={formData.listening}
            onChange={handleChange}
            placeholder="Nghe"
            className="p-2 border"
          />
          <input
            name="speaking"
            value={formData.speaking}
            onChange={handleChange}
            placeholder="Nói"
            className="p-2 border"
          />
          <input
            name="reading"
            value={formData.reading}
            onChange={handleChange}
            placeholder="Đọc"
            className="p-2 border"
          />
          <input
            name="writing"
            value={formData.writing}
            onChange={handleChange}
            placeholder="Viết"
            className="p-2 border"
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
