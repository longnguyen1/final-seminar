"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";


interface ExpertForm {
  fullName: string;
  birthYear: number | null;
  gender: string;
  academicTitle: string;
  academicTitleYear: number | null;
  degree: string;
  degreeYear: number | null;
  position: string;
  currentWork: string;
  organization: string;
  email: string; // ✅ mới
  phone: string; // ✅ mới
}

export default function ExpertFormModal({ isOpen, onClose, onSave, expert }: any) {
  const emptyFormData: ExpertForm = {
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
    email: '', // ✅
    phone: '', // ✅
  };

  const [formData, setFormData] = useState<ExpertForm>(emptyFormData);

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
        email: expert.email || '', // ✅
        phone: expert.phone || '', // ✅
      });
    } else {
      setFormData(emptyFormData);
    }
  }, [expert]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("Year") ? (value === '' ? null : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const method = expert ? "PUT" : "POST";
    const url = expert ? `/api/experts/${expert.id}` : "/api/experts";

    const res = await fetch(url, {
      method,
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast.success("💾 Lưu thành công!");
      onSave();
      onClose();
    } else {
      toast.error("❌ Thao tác thất bại!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-lg grid grid-cols-2 gap-4 w-[800px]">
        <input className="p-2 border" name="fullName" placeholder="Họ tên" value={formData.fullName} onChange={handleChange} />
        <input className="p-2 border" name="birthYear" placeholder="Năm sinh" type="number" value={formData.birthYear ?? ''} onChange={handleChange} />
        <input className="p-2 border" name="gender" placeholder="Giới tính" value={formData.gender} onChange={handleChange} />
        <input className="p-2 border" name="organization" placeholder="Đơn vị" value={formData.organization} onChange={handleChange} />
        <input className="p-2 border" name="academicTitle" placeholder="Học hàm" value={formData.academicTitle} onChange={handleChange} />
        <input className="p-2 border" name="academicTitleYear" placeholder="Năm phong học hàm" type="number" value={formData.academicTitleYear ?? ''} onChange={handleChange} />
        <input className="p-2 border" name="degree" placeholder="Học vị" value={formData.degree} onChange={handleChange} />
        <input className="p-2 border" name="degreeYear" placeholder="Năm đạt học vị" type="number" value={formData.degreeYear ?? ''} onChange={handleChange} />
        <input className="p-2 border" name="position" placeholder="Chức vụ" value={formData.position} onChange={handleChange} />
        <input className="p-2 border" name="currentWork" placeholder="Công việc hiện nay" value={formData.currentWork} onChange={handleChange} />
        <input className="p-2 border" name="email" placeholder="Email" value={formData.email} onChange={handleChange} /> {/* ✅ mới */}
        <input className="p-2 border" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} /> {/* ✅ mới */}

        <div className="flex justify-end col-span-2 gap-2 mt-4">
          <button type="button" className="px-4 py-2 border" onClick={onClose}>Huỷ</button>
          <button type="submit" className="px-4 py-2 text-white bg-blue-600">Lưu</button>
        </div>
      </form>
    </div>
  );
}
