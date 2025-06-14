'use client';

import { useState, useEffect } from 'react';

interface ExpertFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  expert?: {
    id?: number;
    fullName?: string;
    birthYear?: number | null;
    gender?: string;
    academicTitle?: string;
    academicTitleYear?: number | null;
    degree?: string;
    degreeYear?: number | null;
    position?: string;
    currentWork?: string;
    organization?: string;
  };
}

const emptyFormData = {
  fullName: '',
  birthYear: null,
  gender: '',
  academicTitle: '',
  academicTitleYear: null,
  degree: '',
  degreeYear: null,
  position: '',
  currentWork: '',
  organization: '',
};

export default function ExpertFormModal({
  isOpen,
  onClose,
  onSave,
  expert,
}: ExpertFormModalProps) {
  const [formData, setFormData] = useState({ ...emptyFormData });

  useEffect(() => {
    if (expert) {
      setFormData({
        fullName: expert.fullName || '',
        birthYear: expert.birthYear ?? null,
        gender: expert.gender || '',
        academicTitle: expert.academicTitle || '',
        academicTitleYear: expert.academicTitleYear ?? null,
        degree: expert.degree || '',
        degreeYear: expert.degreeYear ?? null,
        position: expert.position || '',
        currentWork: expert.currentWork || '',
        organization: expert.organization || '',
      });
    } else {
      setFormData({ ...emptyFormData });
    }
  }, [expert?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.endsWith('Year') || name === 'birthYear'
        ? value === '' ? null : Number(value)
        : value,
    }));
  };

  const handleSubmit = async () => {
    const method = expert?.id ? 'PUT' : 'POST';
    const url = expert?.id ? `/api/experts/${expert.id}` : '/api/experts';

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
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-md">
        <h2 className="text-xl font-bold mb-4">
          {expert?.id ? 'Chỉnh sửa chuyên gia' : 'Thêm chuyên gia'}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <input className="border p-2" name="fullName" placeholder="Họ tên" value={formData.fullName} onChange={handleChange} />
          <input className="border p-2" name="birthYear" type="number" placeholder="Năm sinh" value={formData.birthYear ?? ''} onChange={handleChange} />
          <input className="border p-2" name="gender" placeholder="Giới tính" value={formData.gender} onChange={handleChange} />
          <input className="border p-2" name="organization" placeholder="Đơn vị" value={formData.organization} onChange={handleChange} />
          <input className="border p-2" name="academicTitle" placeholder="Học hàm" value={formData.academicTitle} onChange={handleChange} />
          <input className="border p-2" name="academicTitleYear" type="number" placeholder="Năm phong HH" value={formData.academicTitleYear ?? ''} onChange={handleChange} />
          <input className="border p-2" name="degree" placeholder="Học vị" value={formData.degree} onChange={handleChange} />
          <input className="border p-2" name="degreeYear" type="number" placeholder="Năm đạt học vị" value={formData.degreeYear ?? ''} onChange={handleChange} />
          <input className="border p-2" name="position" placeholder="Chức vụ" value={formData.position} onChange={handleChange} />
          <input className="border p-2" name="currentWork" placeholder="Công việc hiện nay" value={formData.currentWork} onChange={handleChange} />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
            Hủy
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
            {expert?.id ? 'Lưu' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
}
