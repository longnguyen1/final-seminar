// app/admin/experts/[id]/components/ExpertInfoForm.tsx
'use client';

import { useState } from 'react';

export default function ExpertInfoForm({
  expert,
  onSaved,
}: {
  expert: any;
  onSaved: (updated: any) => void;
}) {
  const [form, setForm] = useState({ ...expert });

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
    <div className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-lg font-semibold">Thông tin chung</h2>
      <div className="grid grid-cols-2 gap-4">
        <input name="fullName" value={form.fullName} onChange={handleChange} className="border p-2" placeholder="Họ tên" />
        <input name="birthYear" type="number" value={form.birthYear ?? ''} onChange={handleChange} className="border p-2" placeholder="Năm sinh" />
        <input name="gender" value={form.gender || ''} onChange={handleChange} className="border p-2" placeholder="Giới tính" />
        <input name="organization" value={form.organization || ''} onChange={handleChange} className="border p-2" placeholder="Đơn vị" />
        <input name="academicTitle" value={form.academicTitle || ''} onChange={handleChange} className="border p-2" placeholder="Học hàm" />
        <input name="academicTitleYear" type="number" value={form.academicTitleYear ?? ''} onChange={handleChange} className="border p-2" placeholder="Năm phong học hàm" />
        <input name="degree" value={form.degree || ''} onChange={handleChange} className="border p-2" placeholder="Học vị" />
        <input name="degreeYear" type="number" value={form.degreeYear ?? ''} onChange={handleChange} className="border p-2" placeholder="Năm đạt học vị" />
        <input name="position" value={form.position || ''} onChange={handleChange} className="border p-2" placeholder="Chức vụ" />
        <input name="currentWork" value={form.currentWork || ''} onChange={handleChange} className="border p-2" placeholder="Công việc hiện nay" />
      </div>
      <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">
        💾 Lưu thông tin
      </button>
    </div>
  );
}
