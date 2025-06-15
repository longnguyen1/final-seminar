'use client';

import { useState } from 'react';

// ✅ 1. Khai báo type Expert chuẩn
type Expert = {
  id: string;
  fullName: string;
  birthYear?: number | null;
  gender?: string | null;
  organization?: string | null;
  academicTitle?: string | null;
  academicTitleYear?: number | null;
  degree?: string | null;
  degreeYear?: number | null;
  position?: string | null;
  currentWork?: string | null;
};

export default function ExpertInfoForm({
  expert,
  onSaved,
}: {
  expert: Expert;
  onSaved: (updated: Expert) => void;
}) {
  const [form, setForm] = useState<Expert>({ ...expert });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name.includes('Year') ? (value === '' ? null : Number(value)) : value,
    }));
  };

  const handleSave = async () => {
    const res = await fetch(`/api/experts/${expert.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const updated = await res.json();
    onSaved(updated);
    alert('Lưu thông tin thành công');
  };

  return (
    <div className="p-6 space-y-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold">Thông tin chung</h2>
      <div className="grid grid-cols-2 gap-4">
        <input name="fullName" value={form.fullName} onChange={handleChange} className="p-2 border" placeholder="Họ tên" />
        <input name="birthYear" type="number" value={form.birthYear ?? ''} onChange={handleChange} className="p-2 border" placeholder="Năm sinh" />
        <input name="gender" value={form.gender || ''} onChange={handleChange} className="p-2 border" placeholder="Giới tính" />
        <input name="organization" value={form.organization || ''} onChange={handleChange} className="p-2 border" placeholder="Đơn vị" />
        <input name="academicTitle" value={form.academicTitle || ''} onChange={handleChange} className="p-2 border" placeholder="Học hàm" />
        <input name="academicTitleYear" type="number" value={form.academicTitleYear ?? ''} onChange={handleChange} className="p-2 border" placeholder="Năm phong học hàm" />
        <input name="degree" value={form.degree || ''} onChange={handleChange} className="p-2 border" placeholder="Học vị" />
        <input name="degreeYear" type="number" value={form.degreeYear ?? ''} onChange={handleChange} className="p-2 border" placeholder="Năm đạt học vị" />
        <input name="position" value={form.position || ''} onChange={handleChange} className="p-2 border" placeholder="Chức vụ" />
        <input name="currentWork" value={form.currentWork || ''} onChange={handleChange} className="p-2 border" placeholder="Công việc hiện nay" />
      </div>
      <button onClick={handleSave} className="px-4 py-2 text-white bg-blue-600 rounded">
        💾 Lưu thông tin
      </button>
    </div>
  );
}
