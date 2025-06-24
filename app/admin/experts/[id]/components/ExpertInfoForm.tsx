"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";


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
  email?: string | null;
  phone?: string | null;
};

export default function ExpertInfoForm({
  expert,
  onSaved,
}: {
  expert: Expert;
  onSaved: (e: Expert) => void;
}) {
  const [form, setForm] = useState<Expert | null>(expert || null);

  useEffect(() => {
    setForm(expert || null);
  }, [expert]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev!, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch(`/api/experts/${form!.id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
    const updated = await res.json();
    onSaved(updated); // ✅ callback update parent expert
    toast.success("✅ Thành công!");
  };

  if (!form) return <p>Đang tải...</p>;

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      <input name="fullName" value={form.fullName} onChange={handleChange} className="p-2 border" placeholder="Họ tên" />
      <input name="birthYear" type="number" value={form.birthYear ?? ''} onChange={handleChange} className="p-2 border" placeholder="Năm sinh" />
      <input name="gender" value={form.gender ?? ''} onChange={handleChange} className="p-2 border" placeholder="Giới tính" />
      <input name="organization" value={form.organization ?? ''} onChange={handleChange} className="p-2 border" placeholder="Đơn vị" />
      <input name="academicTitle" value={form.academicTitle ?? ''} onChange={handleChange} className="p-2 border" placeholder="Học hàm" />
      <input name="academicTitleYear" type="number" value={form.academicTitleYear ?? ''} onChange={handleChange} className="p-2 border" placeholder="Năm phong học hàm" />
      <input name="degree" value={form.degree ?? ''} onChange={handleChange} className="p-2 border" placeholder="Học vị" />
      <input name="degreeYear" type="number" value={form.degreeYear ?? ''} onChange={handleChange} className="p-2 border" placeholder="Năm đạt học vị" />
      <input name="position" value={form.position ?? ''} onChange={handleChange} className="p-2 border" placeholder="Chức vụ" />
      <input name="currentWork" value={form.currentWork ?? ''} onChange={handleChange} className="p-2 border" placeholder="Công việc hiện nay" />
      <input name="email" value={form.email ?? ''} onChange={handleChange} className="p-2 border" placeholder="Email" />
      <input name="phone" value={form.phone ?? ''} onChange={handleChange} className="p-2 border" placeholder="Số điện thoại" />
      <button type="submit" className="col-span-2 px-4 py-2 text-white bg-blue-600">Lưu</button>
    </form>
  );
}
