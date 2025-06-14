// app/admin/experts/[id]/components/WorkHistoryFormModal.tsx
'use client';

import { useState, useEffect } from 'react';

interface WorkHistory {
  id?: number;
  startYear: number | null;
  endYear: number | null;
  position: string;
  workplace: string;
  field: string;
  expertId: number;
}

const emptyData: Omit<WorkHistory, 'id'> = {
  startYear: null,
  endYear: null,
  position: '',
  workplace: '',
  field: '',
  expertId: 0,
};

export default function WorkHistoryFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: WorkHistory;
}) {
  const [formData, setFormData] = useState<WorkHistory>({
    ...emptyData,
    ...initialData,
  });

  // Khi initialData thay đổi, cập nhật lại formData
  useEffect(() => {
    setFormData({
      ...emptyData,
      ...initialData,
    });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'startYear' || name === 'endYear'
          ? value === '' 
            ? null 
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id
      ? `/api/workHistories/${formData.id}`
      : `/api/workHistories`;

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
          {formData.id ? 'Sửa' : 'Thêm'} lịch sử công tác
        </h2>
        <div className="grid grid-cols-2 gap-4">
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
            name="position"
            placeholder="Chức vụ"
            value={formData.position}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="workplace"
            placeholder="Nơi công tác"
            value={formData.workplace}
            onChange={handleChange}
            className="border p-2"
          />
          <input
            name="field"
            placeholder="Lĩnh vực"
            value={formData.field}
            onChange={handleChange}
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
